<script
	lang="ts"
	generics="TContext extends object"
>
	import type { ColumnDefTemplate } from "@tanstack/table-core";
	import { RenderComponentConfig, RenderSnippetConfig } from "./render-helpers.js";
	import type { Attachment } from "svelte/attachments";
	type Props = {
		/** The cell or header field of the current cell's column definition. */
		content?: ColumnDefTemplate<TContext>;
		/** The result of the `getContext()` function of the header or cell */
		context: TContext;

		/** Used to pass attachments that can't be gotten through context */
		attach?: Attachment;
	};

	let { content, context, attach }: Props = $props();
</script>

{#if typeof content === "string"}
	{content}
{:else if content instanceof Function}
	{@const result = content(context)}
	{#if result instanceof RenderComponentConfig}
		{@const { component: Component, props } = result}
		<Component {...props} {attach} />
	{:else if result instanceof RenderSnippetConfig}
		{@const { snippet, params } = result}
		{@render snippet({ ...params, attach })}
	{:else}
		{result}
	{/if}
{/if}
