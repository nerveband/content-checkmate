<script lang="ts">
  import { analysisStore } from '$lib/stores/analysis.svelte';
  import { PREDEFINED_EXCLUSION_TAGS } from '$lib/data/policies';
  import Checkbox from '$lib/components/ui/Checkbox.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';

  let showCustom = $state(false);
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <div>
      <h3 class="text-sm font-medium text-gray-900">Exclusion Rules</h3>
      <p class="text-xs text-gray-500 mt-0.5">Exclude content that shouldn't be flagged</p>
    </div>
    <button
      type="button"
      class="text-xs text-accent hover:underline"
      onclick={() => showCustom = !showCustom}
    >
      {showCustom ? 'Hide' : 'Show'} custom rules
    </button>
  </div>

  <!-- Predefined Tags -->
  <div class="grid grid-cols-2 gap-2">
    {#each PREDEFINED_EXCLUSION_TAGS as tag}
      <Checkbox
        checked={analysisStore.selectedExclusionTags.includes(tag.id)}
        label={tag.label}
        onchange={() => analysisStore.toggleExclusionTag(tag.id)}
      />
    {/each}
  </div>

  <!-- SIEP Toggle -->
  <div class="pt-2 border-t border-gray-100">
    <Checkbox
      checked={analysisStore.isSiepNotApplicable}
      onchange={(val) => analysisStore.isSiepNotApplicable = val}
      label="SIEP Not Applicable (Social Issues, Elections, Politics)"
    />
    <p class="text-xs text-gray-500 ml-8 mt-1">
      Check this if SIEP restrictions don't apply to your content
    </p>
  </div>

  <!-- Custom Exclusions -->
  {#if showCustom}
    <div class="animate-slide-up">
      <Textarea
        bind:value={analysisStore.customExclusions}
        label="Custom Exclusion Rules"
        placeholder="Enter one exclusion rule per line..."
        rows={3}
      />
      <p class="text-xs text-gray-500 mt-1">
        Each line is a separate rule. Content matching these will be excluded from violations.
      </p>
    </div>
  {/if}
</div>
