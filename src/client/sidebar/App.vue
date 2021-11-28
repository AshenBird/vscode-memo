<script setup lang="ts">
import { NCollapse, NCollapseItem, NCard, NInput, NConfigProvider, darkTheme } from "naive-ui"
import { usePostMessage } from "./usePostMessage";
import {computed} from "vue"
const { data, config, send } =usePostMessage();

send("init")

const theme = computed(()=>{
  if(config.value.theme === "dark"){
    return darkTheme
  }
  return null
})

</script>
<template>
<n-config-provider :theme="theme">
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