import {defineStore} from "pinia";
import {ref} from "vue";
import { invoke } from '@tauri-apps/api'
import type {BuildInfo} from "./garnish_types";
import {mockBuildData} from "./mock_data";


async function build(input: string): Promise<BuildInfo | null> {
    if (window.__TAURI_IPC__) {
        try {
            return await invoke("build", {name: "default", input: input});
        }catch (e) {
            console.log(e);
            return null;
        }
    }

    // Mock data for working in browser for debugging with Vue
    return mockBuildData();
}

export const useGarnishStore = defineStore("garnish", () => {
    const builds = ref<[BuildInfo]>([]);
    let file_input = ref("");
    let sources = ref([""]);

    function buildSource(source: string) {
        console.log(`Building source`);
        console.log(source);
        build(source).then((info: BuildInfo) => {
            if (info) {
                console.log(info);
                builds.value.push(info)
            }
        });
    }

    function updateSource(index: number, source: string) {
        sources.value[index] = source;
    }

    return { builds, file_input, sources, buildSource, updateSource }
})