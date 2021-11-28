<script setup lang="ts">
import { NCollapse, NCollapseItem, NCard, NInput, NConfigProvider, useOsTheme, darkTheme } from "naive-ui"
const osTheme = useOsTheme()
</script>
<template>
<n-config-provider :theme="darkTheme">
  <n-collapse>
    <n-collapse-item title="待办事项"></n-collapse-item>
    <n-collapse-item title="便笺">
      <n-card>
        <n-input type="textarea" />
      </n-card>
    </n-collapse-item>
  </n-collapse>
  </n-config-provider>
</template>