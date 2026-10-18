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

- Stock-changing transactions (bulk production, repack, purchases, sales, order status) run only through Postgres RPC functions (`produce_bulk`, `repack_product`, `receive_purchase`, `create_sale`, `set_sale_status`) — they validate and update stock atomically and write audit_logs.
- All UI primitives (neumorphic cards, inputs, tabs, badges, bottom nav) live in `src/components/neu.tsx`; tokens and `neu*` utilities in `src/styles.css` — keeps styling in one place so the design can be restyled or mocked up easily.
- Auth gate is client-side in `__root.tsx` (`Gate`) because the session lives in browser storage; `/login` is the only public route.
