<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep Rebeca's mobile chat in a non-modal floating panel inside the existing component, while desktop keeps its sidebar; this preserves conversation state and dashboard visibility.
- Anchor the mobile chat above the software keyboard using visualViewport while editing; fixed CSS bottom alone can be covered by mobile keyboards.
- Own desktop chat visibility in Workspace and keep RebecaPanel mounted while collapsed, so analytics can expand without resetting the conversation or altering the mobile floating chat.
