import {defineStore} from "pinia";
import {ref} from "vue";
import {invoke} from '@tauri-apps/api'
import type {BuildInfo} from "./garnish_types";
import {mockBuildData} from "./mock_data";


async function garnishBuild(input: string): Promise<BuildInfo | null> {
    if (window.__TAURI_IPC__) {
        try {
            return await invoke("build", {name: "default", input: input});
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    // Mock data for working in browser for debugging with Vue
    return mockBuildData();
}

async function garnishInitializeExecution(): Promise<BuildInfo | null> {
    if (window.__TAURI_IPC__) {
        try {
            return await invoke("initialize_execution");
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    // Mock data for working in browser for debugging with Vue
    return mockBuildData();
}

async function garnishGetExecutionBuild(): Promise<BuildInfo | null> {
    if (window.__TAURI_IPC__) {
        try {
            return await invoke("get_execution_build");
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    // Mock data for working in browser for debugging with Vue
    return mockBuildData();
}

export const useGarnishStore = defineStore("garnish", () => {
    const builds = ref<BuildInfo[]>([]);
    const executionBuild = ref<BuildInfo | null>(null);
    const file_input = ref("");
    const sources = ref([""]);
    const activeOutputTab = ref<"lex" | "parse" | "build">("build");
    const activeSource = ref(0);
    const config = ref({
        tabSize: 2,
        buildDataRowWidth: 10,
    });

    function buildSource(index: number) {
        garnishBuild(sources[index]).then((info: BuildInfo) => {
            if (info) {
                console.log(info);
                builds.value.push(info)
            }
        });
    }

    function initializeExecution() {
        garnishInitializeExecution().then((info: BuildInfo) => {
            if (info) {
                console.log(info);
                executionBuild.value = info;
            }
        });
    }

    function getExecutionBuild() {
        garnishGetExecutionBuild().then((info: BuildInfo) => {
            if (info) {
                console.log(info);
                executionBuild.value = info;
            }
        });
    }

    function updateSource(index: number, source: string) {
        sources.value[index] = source;
    }

    function setLexActive() {
        activeOutputTab.value = "lex";
    }

    function setParseActive() {
        activeOutputTab.value = "parse";
    }

    function setBuildActive() {
        activeOutputTab.value = "build";
    }

    return {
        config,
        builds,
        executionBuild,
        file_input,
        sources,
        activeOutputTab,
        activeSource,
        updateSource,
        buildSource,
        setLexActive,
        setParseActive,
        setBuildActive,
        initializeExecution,
        getExecutionBuild
    }
})