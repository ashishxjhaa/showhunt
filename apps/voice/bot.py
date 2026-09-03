# ShowHunt voice bot: Sarvam STT/TTS, DeepSeek, allowlisted tools.

import os

from dotenv import load_dotenv
from loguru import logger
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.frames.frames import LLMRunFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.worker import PipelineParams, PipelineWorker
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import (
    LLMContextAggregatorPair,
    LLMUserAggregatorParams,
)
from pipecat.processors.frameworks.rtvi import (
    RTVIFunctionCallReportLevel,
    RTVIObserverParams,
)
from pipecat.services.deepseek.llm import DeepSeekLLMService
from pipecat.services.sarvam.stt import SarvamRealtimeSTTService
from pipecat.services.sarvam.tts import SarvamTTSService
from pipecat.transports.base_transport import TransportParams
from pipecat.transports.smallwebrtc.transport import SmallWebRTCTransport
from pipecat.workers.runner import WorkerRunner

from tools import SYSTEM_PROMPT, ClientToolBridge, build_tools

load_dotenv(override=True)

# Tools that run in the browser. Report FULL so client handlers fire.
_CLIENT_TOOLS = [
    "get_page_info",
    "navigate",
    "go_back",
    "scroll_to",
    "set_listings_page",
    "search_listings",
    "filter_by_tag",
    "open_listing",
    "open_builder",
    "fill_signup",
    "fill_signin",
    "submit_auth",
    "open_upload",
    "fill_listing",
    "enrich_from_url",
    "upload_next",
    "upload_previous",
    "upload_goto_step",
    "submit_listing",
    "set_upload_link",
    "remove_upload_link",
    "edit_listing",
    "delete_listing",
    "cancel_delete_listing",
    "confirm_delete_listing",
    "open_avatar_picker",
    "set_avatar",
    "sign_out",
    "upvote_listing",
    "fill_comment",
    "submit_comment",
    "open_link",
    "open_similar",
    "open_profile_editor",
    "fill_profile",
]


async def run_bot(webrtc_connection):
    sarvam_key = os.getenv("SARVAM_API_KEY")
    deepseek_key = os.getenv("DEEPSEEK_API_KEY")
    if not sarvam_key:
        raise RuntimeError("SARVAM_API_KEY is not set")
    if not deepseek_key:
        raise RuntimeError("DEEPSEEK_API_KEY is not set")

    transport = SmallWebRTCTransport(
        webrtc_connection=webrtc_connection,
        params=TransportParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            audio_out_10ms_chunks=2,
        ),
    )

    # Silero VAD owns turn ends, so use manual endpointing.
    stt = SarvamRealtimeSTTService(
        api_key=sarvam_key,
        endpointing="manual",
        settings=SarvamRealtimeSTTService.Settings(
            language_code="en-IN",
            stream_type="balanced",
            mode="transcribe",
        ),
    )

    tts = SarvamTTSService(
        api_key=sarvam_key,
        settings=SarvamTTSService.Settings(
            voice="shubh",
            model="bulbul:v3",
        ),
    )

    llm = DeepSeekLLMService(
        api_key=deepseek_key,
        settings=DeepSeekLLMService.Settings(
            model="deepseek-chat",
            system_instruction=SYSTEM_PROMPT,
            temperature=0.3,
            max_tokens=80,
        ),
    )

    context = LLMContext(tools=build_tools())
    user_aggregator, assistant_aggregator = LLMContextAggregatorPair(
        context,
        user_params=LLMUserAggregatorParams(
            vad_analyzer=SileroVADAnalyzer(),
        ),
    )

    bridge = ClientToolBridge()

    pipeline = Pipeline(
        [
            transport.input(),
            stt,
            user_aggregator,
            llm,
            tts,
            transport.output(),
            bridge,
            assistant_aggregator,
        ]
    )

    report_level = {
        "*": RTVIFunctionCallReportLevel.NONE,
        "answer_about_showhunt": RTVIFunctionCallReportLevel.NONE,
    }
    for name in _CLIENT_TOOLS:
        report_level[name] = RTVIFunctionCallReportLevel.FULL

    worker = PipelineWorker(
        pipeline,
        params=PipelineParams(
            enable_metrics=True,
            enable_usage_metrics=True,
        ),
        rtvi_observer_params=RTVIObserverParams(
            function_call_report_level=report_level,
        ),
    )

    runner = WorkerRunner(handle_sigint=False)
    await runner.add_workers(worker)

    greeted = {"done": False}

    @worker.rtvi.event_handler("on_client_ready")
    async def on_client_ready(rtvi):
        if greeted["done"]:
            return
        greeted["done"] = True
        logger.info("ShowHunt voice client ready, greeting")
        context.add_message(
            {
                "role": "user",
                "content": "Greet me in one short sentence as Cody, then ask how you can help.",
            }
        )
        await worker.queue_frames([LLMRunFrame()])

    @worker.rtvi.event_handler("on_client_message")
    async def on_client_message(rtvi, msg):
        if getattr(msg, "type", None) != "page_context":
            return
        data = getattr(msg, "data", None) or {}
        profile = data.get("profile") or {}
        listing = data.get("listingDetail") or {}
        links = listing.get("links") or []
        similar = data.get("similarListings") or []
        visible = data.get("visibleListings") or []
        # Short note so tools stay aware of the live UI.
        summary = (
            f"Live page: route={data.get('route')}, "
            f"signedIn={data.get('signedIn')}, "
            f"previousRoute={data.get('previousRoute')}, "
            f"listings={len(visible)}, "
            f"similar={len(similar)}, "
            f"builderState={profile.get('stateName') or profile.get('state')}, "
            f"listing={listing.get('name')}, "
            f"links={[l.get('label') for l in links if isinstance(l, dict)]}"
        )
        context.add_message({"role": "developer", "content": summary})

    @transport.event_handler("on_client_disconnected")
    async def on_client_disconnected(transport, client):
        logger.info("ShowHunt voice client disconnected")
        await runner.cancel()

    await runner.run()
