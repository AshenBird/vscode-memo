<script setup lang="ts">
import {
  NCollapse,
  NCollapseItem,
  NCard,
  NInput,
  NConfigProvider,
  darkTheme,
  NButton,
  NIcon,
} from "naive-ui";
import {
  // EllipsisHorizontal,
  Add as AddIcon,
  CloseCircleOutline,
} from "@vicons/ionicons5";
import { usePostMessage } from "./usePostMessage";
import { computed } from "vue";
const { data, config, send } = usePostMessage();

send("init");

const theme = computed(() => {
  if (config.value.theme === "dark") {
    return darkTheme;
  }
  return null;
});
const collapseClick = () => {
  console.log("a");
};
</script>
<template>
  <n-config-provider :theme="theme">
    <n-collapse>
      <n-collapse-item title="待办事项"></n-collapse-item>
      <n-collapse-item class="memos" title="便笺">
        <template #header-extra>
          <n-button text #icon @click.stop="collapseClick"
            ><n-icon><AddIcon /></n-icon
          ></n-button>
        </template>
        <n-card header-style="padding: 0px !important">
          <template #header>
            <n-input
              style="border-radius: 0; border-bottom: 1px solid #999"
              placeholder="标题"
            >
              <template #suffix>
                <n-button text #icon @click.stop="collapseClick"
                  ><n-icon><CloseCircleOutline /></n-icon
                ></n-button>
              </template>
            </n-input>
          </template>
          <n-input
            style="border-radius: 0"
            type="textarea"
            :rows="8"
            placeholder="内容"
          />
        </n-card>
        <n-button style="width: 100%; margin-top: 10px">添加</n-button>
      </n-collapse-item>
    </n-collapse>
  </n-config-provider>
</template>
<style>
.memos .n-card > .n-card__content {
  padding: 0 !important;
}
</style>
