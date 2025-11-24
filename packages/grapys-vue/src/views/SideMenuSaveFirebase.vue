<template>
  <h2 class="text-left font-bold">Graph Storage</h2>
  <div>
    <button @click="save" class="mb-1 w-full cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
      Save as New
    </button>
  </div>

  <div v-if="graphDataSet.length > 0" class="mt-4 text-left">
    <label class="mb-0.5 block text-xs text-gray-600">Select saved graph:</label>
    <select class="mb-1 w-full resize-none rounded-md border-2 border-gray-300 px-2 py-1 text-black" v-model="selectedGraph">
      <option v-for="(graph, key) in graphDataSet" :key="key" :value="key">
        {{ graph.name }}
      </option>
    </select>

    <div>
      <button
        @click="loadData"
        class="mb-1 w-full cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
      >
        Load Graph
      </button>
    </div>

    <div>
      <button
        @click="updateData"
        class="mb-1 w-full cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
      >
        Overwrite save
      </button>
    </div>

    <div>
      <button
        @click="deleteData"
        class="mb-1 w-full cursor-pointer items-center rounded-full bg-red-400 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
      >
        Delete data
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, ref } from "vue";
import { useFlowStore } from "vueweave";
import { useGraphAIStore } from "../store/graphai";
import { useFirebaseStore } from "../store/firebase";
import { serverTimestamp, doc, collection, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebase/firebase";

type FirebaseGraphData = {
  name: string;
  jsonString: string;
  uid: string;
  graphId: string;
};

export default defineComponent({
  components: {},
  setup() {
    const store = useFlowStore();
    const graphAIStore = useGraphAIStore();
    const firebaseStore = useFirebaseStore();

    const uid = firebaseStore?.firebaseUser?.uid;
    const path = `/users/${uid}/graphData`;

    const save = async () => {
      const name = window.prompt("Input data name");
      if (name) {
        const graphData = graphAIStore.createGraphData(store.currentData);
        const dataStr = JSON.stringify(graphData);
        const graphDoc = doc(collection(db, path));
        // console.log(graphId);
        const saveData = {
          name,
          jsonString: dataStr,
          uid,
          graphId: graphDoc.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        console.log(saveData, graphDoc.path);
        await setDoc(graphDoc, saveData);
      }
      // window.localStorage.setItem("GRAPHAIGUI", dataStr);
    };

    const selectedGraph = ref(0);
    const graphDataSet = ref<FirebaseGraphData[]>([]);
    const graphDataDetacher = onSnapshot(collection(db, path), (dataSet) => {
      if (dataSet.empty) {
        graphDataSet.value = [];
      } else {
        graphDataSet.value = dataSet.docs.map((data) => {
          return data.data() as FirebaseGraphData;
        });
        //
        if (graphDataSet.value.length <= selectedGraph.value) {
          selectedGraph.value = graphDataSet.value.length - 1;
        }
      }
    });

    const loadData = () => {
      const data = graphDataSet.value[selectedGraph.value];
      try {
        if (data) {
          const graphData = JSON.parse(data.jsonString);
          // BACKWARD COMPATIBILITY: Support old format where loop was at root level
          const loadedData = graphData.metadata.data;
          store.loadData(loadedData);
        }
      } catch (error) {
        console.log(error);
      }
    };
    const updateData = async () => {
      const data = graphDataSet.value[selectedGraph.value];
      if (window.confirm(`Really update data to ${data.name} ??`)) {
        const dataPath = `${path}/${data?.graphId}`;
        const graphData = graphAIStore.createGraphData(store.currentData);
        const dataStr = JSON.stringify(graphData);

        await updateDoc(doc(db, dataPath), {
          jsonString: dataStr,
          updatedAt: serverTimestamp(),
        });
      }
    };
    const deleteData = async () => {
      const data = graphDataSet.value[selectedGraph.value];
      if (window.confirm(`Really delete ${data.name} ??`)) {
        const dataPath = `${path}/${data?.graphId}`;
        await deleteDoc(doc(db, dataPath));
      }
    };

    onUnmounted(() => {
      if (graphDataDetacher) {
        graphDataDetacher();
      }
    });

    return {
      save,
      updateData,
      loadData,
      deleteData,

      graphDataSet,
      selectedGraph,
    };
  },
});
</script>
