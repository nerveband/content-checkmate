<script lang="ts">
  const currentYear = new Date().getFullYear();
</script>

<footer class="bg-white border-t border-gray-200 mt-auto">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2 text-sm text-gray-500">
        <span>&copy; {currentYear} Content Checkmate</span>
        <span class="hidden sm:inline">|</span>
        <span class="hidden sm:inline">Powered by Gemini AI</span>
      </div>

      <div class="flex items-center gap-4 text-sm text-gray-500">
        <span class="flex items-center gap-1.5">
          <span class="w-2 h-2 bg-positive rounded-full animate-pulse"></span>
          Using gemini-3-flash-preview
        </span>
      </div>
    </div>
  </div>
</footer>
