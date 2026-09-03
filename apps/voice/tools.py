# Allowlisted ShowHunt tools for DeepSeek.
# UI tools wait for the browser via RTVI function-call results.

from __future__ import annotations

import asyncio
from typing import Any

from loguru import logger
from pipecat.frames.frames import FunctionCallResultFrame
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor
from pipecat.services.llm_service import FunctionCallParams
from pipecat.workers.llm.tool_decorator import tool_options

# tool_call_id -> Future resolved by ClientToolBridge
_pending: dict[str, asyncio.Future[Any]] = {}

SHOWHUNT_KNOWLEDGE = """
ShowHunt is a free product launch platform for developers and founders.
Builders list side projects and early products, get discovered, and collect upvotes and discussion over time.
Always-on and free to list. No launch-day lottery. Upvotes push trending. Tags: up to three curated tags.
AI can draft listing fields from a product URL. Main areas: landing, Browse, listing detail, auth, Profile, public builder pages.
""".strip()

SYSTEM_PROMPT = """
You are Cody, ShowHunt voice guide. Spoken replies only. Be brief.
One short sentence after tools. Never narrate steps. No markdown, bullets, or emojis.
Greet once in under ten words. You are an AI voice assistant.

Call tools instead of guessing. Never invent clicks.

Tools:
- get_page_info for page facts like builder state, links, similar listings.
- go_back to return to the previous page. When the upload drawer is open, use upload_previous for the form step instead.
- open_listing with name=first/third or index for feed or builder projects.
- open_similar for sidebar similar listings on a listing page.
- open_link for sidebar links like website, github, youtube.
- fill_comment then submit_comment to post a discussion comment.
- fill_listing to set live link and other listing fields. Bare domains like echo.com are OK.
- upload_next / upload_previous / upload_goto_step for the upload wizard. submit_listing only to publish.
- set_upload_link / remove_upload_link for social links in the upload drawer (Product Hunt, YouTube, last, first).
- edit_listing / delete_listing on the profile page. delete_listing opens the type-name-to-confirm dialog; it does not delete yet. Use confirm_delete_listing only when the user clearly asks to confirm or delete. Use cancel_delete_listing when they say cancel.
- open_avatar_picker / set_avatar with choice 1-20 or a seed name like ember.
- sign_out to log out when the user asks.
- navigate, scroll_to, search, filter, auth, profile tools as needed.

Never speak passwords. Google sign-in needs a manual tap.
For email, pass only the address like name@gmail.com. Never put the person's name in the email field. If speech is unclear, ask them to spell the email.
When the user gives a live link, call fill_listing with link. Do not only call open_upload.
Only submit, upvote, confirm delete, sign out, or post a comment when the user clearly asks.
""".strip()


class ClientToolBridge(FrameProcessor):
    # Resolve pending tool Futures when the browser returns RTVI results.

    async def process_frame(self, frame, direction: FrameDirection):
        await super().process_frame(frame, direction)

        if isinstance(frame, FunctionCallResultFrame):
            fut = _pending.get(frame.tool_call_id)
            if fut and not fut.done():
                fut.set_result(frame.result)
                # Swallow. The waiting handler will re-emit via result_callback.
                return

        await self.push_frame(frame, direction)


async def _wait_for_client(params: FunctionCallParams) -> None:
    loop = asyncio.get_running_loop()
    fut: asyncio.Future[Any] = loop.create_future()
    _pending[params.tool_call_id] = fut
    try:
        result = await asyncio.wait_for(fut, timeout=28)
        await params.result_callback(result)
    except asyncio.TimeoutError:
        logger.warning(f"Client tool timed out: {params.function_name}")
        await params.result_callback({"ok": False, "error": "The page did not respond in time"})
    finally:
        _pending.pop(params.tool_call_id, None)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def get_page_info(params: FunctionCallParams):
    """Return the live ShowHunt page context from the browser."""
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def answer_about_showhunt(params: FunctionCallParams, topic: str = ""):
    """Answer questions about ShowHunt using product FAQ knowledge.

    Args:
        topic: Optional topic the user asked about.
    """
    await params.result_callback(
        {
            "ok": True,
            "topic": topic or None,
            "knowledge": SHOWHUNT_KNOWLEDGE,
        }
    )


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def navigate(params: FunctionCallParams, path: str):
    """Navigate to an allowlisted ShowHunt path.

    Args:
        path: Route such as /, /listings, /signin, /signup, /profile, /listings/{id}, /u/{username}.
    """
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def go_back(params: FunctionCallParams):
    """Go back to the previous ShowHunt page."""
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def scroll_to(params: FunctionCallParams, target: str):
    """Smoothly scroll to a named section or page position.

    Args:
        target: One of hero, stats, features, how-it-works, faq, cta, footer, top, bottom, discussion, listings.
    """
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def set_listings_page(params: FunctionCallParams, page: str):
    """Change listings pagination.

    Args:
        page: next, prev, or a page number as a string.
    """
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def search_listings(params: FunctionCallParams, query: str):
    """Search listings by text query.

    Args:
        query: Search text. Empty string clears search.
    """
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def filter_by_tag(params: FunctionCallParams, tag: str = ""):
    """Filter the listings feed by a curated tag.

    Args:
        tag: Tag name, or empty to clear the filter.
    """
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def open_listing(
    params: FunctionCallParams,
    name: str = "",
    id: str = "",
    index: str = "",
):
    """Open a listing by name, id, or position in the visible feed.

    Args:
        name: Listing product name, or an ordinal like first/second/1.
        id: Listing id if known.
        index: Zero-based index in the visible listings feed, as a string.
    """
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def open_builder(params: FunctionCallParams, username: str = "", listing_name: str = ""):
    """Open a builder's public profile.

    Args:
        username: Builder username if known.
        listing_name: Listing name to resolve the builder from the current feed or detail page.
    """
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def fill_signup(
    params: FunctionCallParams,
    fullName: str = "",
    email: str = "",
    password: str = "",
):
    """Fill the signup form fields. Never read the password aloud.

    Args:
        fullName: User's full name only. Never put this in the email field.
        email: Email address only, like name@gmail.com with no spaces or person name.
        password: Password to fill silently.
    """
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def fill_signin(params: FunctionCallParams, email: str = "", password: str = ""):
    """Fill the sign-in form fields. Never read the password aloud.

    Args:
        email: Email address only, like name@gmail.com with no spaces or person name.
        password: Password to fill silently.
    """
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def submit_auth(params: FunctionCallParams):
    """Submit the current signup or sign-in form after the user clearly asks."""
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def open_upload(params: FunctionCallParams):
    """Open the upload-project drawer for listing a product."""
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def fill_listing(
    params: FunctionCallParams,
    name: str = "",
    description: str = "",
    link: str = "",
    tags: list[str] | None = None,
    repoUrl: str = "",
    isOpenSource: bool | None = None,
):
    """Fill listing form fields in the upload drawer. Opens the drawer if needed.

    Args:
        name: Product name.
        description: Short pitch.
        link: Live product URL. Bare domains like echo.com are fine; https is added.
        tags: Up to three curated tags.
        repoUrl: Optional repository URL. Bare domains are fine.
        isOpenSource: Whether the project is open source. Omit unless the user said so.
    """
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=45)
async def enrich_from_url(params: FunctionCallParams, url: str):
    """Use ShowHunt AI enrich to draft listing fields from a product URL.

    Args:
        url: Product website URL.
    """
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def upload_next(params: FunctionCallParams):
    """Advance to the next step in the open upload drawer. Not the same as publish."""
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def upload_previous(params: FunctionCallParams):
    """Go to the previous step in the open upload drawer."""
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def upload_goto_step(params: FunctionCallParams, step: str):
    """Jump to a named upload drawer step.

    Args:
        step: One of basics, media, links, or tags.
    """
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def set_upload_link(
    params: FunctionCallParams,
    platform: str = "",
    url: str = "",
    index: str = "",
):
    """Add or update a social link row in the upload drawer links step.

    Args:
        platform: Platform name such as Product Hunt, YouTube, GitHub, X, Twitter.
        url: Social URL. Bare domains are fine.
        index: Optional row position like last, first, or 2.
    """
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def remove_upload_link(
    params: FunctionCallParams,
    query: str = "",
    platform: str = "",
    name: str = "",
    index: str = "",
):
    """Remove a social link row from the upload drawer. Use for delete/remove link requests.

    Args:
        query: Free text like last, Product Hunt, or third.
        platform: Platform name if known.
        name: Alternate name for the link/platform.
        index: Row position like last, first, or 3.
    """
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def submit_listing(params: FunctionCallParams):
    """Submit the listing form after the user clearly asks to publish."""
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def edit_listing(params: FunctionCallParams, name: str = "", query: str = ""):
    """Open the editor for one of the signed-in user's listings on the profile page.

    Args:
        name: Listing name or ordinal like first/second.
        query: Alternate query if name is empty.
    """
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def delete_listing(params: FunctionCallParams, name: str = "", query: str = ""):
    """Open the delete confirmation dialog for a listing. Does not delete yet.

    Args:
        name: Listing name or ordinal like first/second.
        query: Alternate query if name is empty.
    """
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def cancel_delete_listing(params: FunctionCallParams):
    """Cancel the open delete confirmation dialog (same as Cancel)."""
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def confirm_delete_listing(params: FunctionCallParams):
    """Confirm deletion after the dialog is open. Only when the user clearly asks to confirm or delete."""
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def open_avatar_picker(params: FunctionCallParams):
    """Open the avatar picker on the profile page."""
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def set_avatar(params: FunctionCallParams, choice: str = "", name: str = "", index: str = ""):
    """Set the signed-in user's avatar from the 20 Gaze options.

    Args:
        choice: Avatar number 1-20 or seed name like ember, volt, neon.
        name: Alternate seed name if choice is empty.
        index: Alternate number if choice is empty.
    """
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def sign_out(params: FunctionCallParams):
    """Sign the user out after they clearly ask to log out or sign out."""
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def upvote_listing(params: FunctionCallParams, id: str = ""):
    """Upvote the current or named listing. Requires sign-in.

    Args:
        id: Optional listing id. Defaults to the current listing page.
    """
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def fill_comment(params: FunctionCallParams, text: str):
    """Fill the discussion comment box on a listing page.

    Args:
        text: Comment text to write. Do not post until submit_comment.
    """
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def submit_comment(params: FunctionCallParams):
    """Post the filled discussion comment after the user clearly asks."""
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def open_link(params: FunctionCallParams, target: str = "", index: str = ""):
    """Open a sidebar link on the current listing page in a new tab.

    Args:
        target: Link label or platform such as website, github, youtube, repository, first.
        index: Optional zero-based index in the links list, as a string.
    """
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def open_similar(params: FunctionCallParams, name: str = "", id: str = "", index: str = ""):
    """Open a similar listing from the listing detail sidebar.

    Args:
        name: Similar listing name, or an ordinal like first/second/third.
        id: Listing id if known.
        index: Zero-based index in the similar list, as a string.
    """
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def open_profile_editor(params: FunctionCallParams):
    """Open the signed-in user's profile editor drawer."""
    await _wait_for_client(params)


@tool_options(cancel_on_interruption=True, timeout_secs=30)
async def fill_profile(
    params: FunctionCallParams,
    username: str = "",
    bio: str = "",
    twitterUrl: str = "",
    githubUrl: str = "",
    portfolioUrl: str = "",
    linkedinUrl: str = "",
    state: str = "",
    techStack: list[str] | None = None,
):
    """Fill public profile editor fields.

    Args:
        username: Desired username.
        bio: Short bio.
        twitterUrl: Twitter/X URL.
        githubUrl: GitHub URL.
        portfolioUrl: Portfolio URL.
        linkedinUrl: LinkedIn URL.
        state: India state slug if used by the form.
        techStack: Tech stack tags.
    """
    await _wait_for_client(params)


def build_tools():
    return [
        get_page_info,
        answer_about_showhunt,
        navigate,
        go_back,
        scroll_to,
        set_listings_page,
        search_listings,
        filter_by_tag,
        open_listing,
        open_builder,
        fill_signup,
        fill_signin,
        submit_auth,
        open_upload,
        fill_listing,
        enrich_from_url,
        upload_next,
        upload_previous,
        upload_goto_step,
        set_upload_link,
        remove_upload_link,
        submit_listing,
        edit_listing,
        delete_listing,
        cancel_delete_listing,
        confirm_delete_listing,
        open_avatar_picker,
        set_avatar,
        sign_out,
        upvote_listing,
        fill_comment,
        submit_comment,
        open_link,
        open_similar,
        open_profile_editor,
        fill_profile,
    ]


__all__ = [
    "ClientToolBridge",
    "SYSTEM_PROMPT",
    "build_tools",
]
