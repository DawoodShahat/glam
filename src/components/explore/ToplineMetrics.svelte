<script>
  import Tweenable from '../Tweenable.svelte';
  import ToplineRow from './ToplineRow.svelte';

  import { toplineRefLabel } from '../../utils/constants';

  import {
    formatCount,
    formatSignCount,
    formatParenPercent,
  } from '../../utils/formatters';

  export let reference;
  export let hovered;
  export let dataLength;
  export let aggregationLevel;

  function absDiff(a, b, perc = false) {
    return (a - b) / (perc ? b : 1);
  }
</script>

<style>
  .topline {
    display: grid;
    grid-template-columns: max-content max-content max-content max-content;
    grid-column-gap: var(--space-2x);
    font-size: var(--text-02);
    align-items: start;
    min-height: var(--space-8x);
    align-content: start;
  }

  .topline__client-count {
    transition: font-weight 200ms;
  }

  .topline__client-count--highlighted {
    font-weight: 550;
  }

  .topline__client-count__comparison {
    font-weight: 300;
    white-space: pre;
    color: var(--cool-gray-700);
  }
</style>

<div
  class="topline"
  style="padding-left: {toplineRefLabel.left - toplineRefLabel.icon}px;">
  <Tweenable
    params={{ duration: 250 }}
    value={reference.audienceSize}
    let:tweenValue>
    <ToplineRow
      value={reference.label}
      {aggregationLevel}
      description="Set the reference point ⭑ by clicking on one of the graphs below.">
      <span slot="icon">⭑</span>
      <span slot="label">
        {#if dataLength > 2}Reference{:else}Latest{/if}
      </span>
      <span slot="count">
        <span data-value={reference.audienceSize}>
          <span
            class="topline__client-count"
            class:topline--client-count--highlighted={hovered && hovered.audienceSize < tweenValue}>
            {formatCount(tweenValue)}
          </span>
          clients
        </span>
      </span>
    </ToplineRow>
    {#if dataLength > 1}
      <ToplineRow
        params={{ duration: 0 }}
        value={hovered ? hovered.label : undefined}
        compare={reference.label}
        {aggregationLevel}
        description="Hover over the graphs below to compare the hover value ● to the reference ⭑; click to set the hover ● to the reference ⭑.">
        <span slot="icon">●</span>
        <span slot="label">{#if dataLength > 2}
            Hovered
          {:else}Previous{/if}</span>
        <span slot="count">
          <div>
            {#if hovered}
              <span
                class="topline__client-count"
                class:topline__client-count--highlighted={hovered && hovered.audienceSize > tweenValue}>
                {formatCount(hovered.audienceSize)}
              </span>
              clients
            {/if}
          </div>
          {#if hovered}
            <div class="topline__client-count__comparison">
              {formatSignCount(absDiff(hovered.audienceSize, tweenValue))}
              <span
                style="font-weight: 500;">{formatParenPercent('.0%', absDiff(hovered.audienceSize, tweenValue, true), 7)}</span>
            </div>
          {/if}
        </span>
      </ToplineRow>
    {/if}
  </Tweenable>
</div>
