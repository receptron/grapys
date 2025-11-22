# Grapys-Vue GraphAI分離プラン

## 現状の依存関係分析

### GraphAI依存の箇所

#### 1. データ層（最も深い依存）
- **src/utils/gui/graph.ts**: GraphAI GraphDataとの相互変換
  - `store2graphData()`: GUIデータ → GraphAI GraphData
  - `graphToGUIData()`: GraphAI GraphData → GUIデータ
  - `edges2inputs()`: GraphAI入力形式への変換

- **src/utils/gui/utils.ts**:
  - `graphai`パッケージから型とユーティリティをインポート
  - `inputs2dataSources`, `isComputedNodeData`, `isStaticNodeData`

#### 2. コンポーネント層
- **src/views/Node.vue**: GraphAI固有のNodeStaticValue, NodeComputedParamsを含む
- **src/views/Node2.vue**: GraphAI固有の要素を削除した軽量版（結果表示のみ）
- **src/views/NodeStaticValue.vue**: 静的ノード値編集（GraphAI固有ではない）
- **src/views/NodeComputedParams.vue**: agentProfilesに依存
- **src/views/NodeResult.vue**: store.graphAIResultsに依存
- **src/views/AddNode.vue**: agentProfilesに依存

#### 3. データ定義層
- **src/utils/gui/data.ts**: agentProfiles定義（GraphAI Agent固有）

#### 4. Store層
- **src/store/index.ts**:
  - `graphAIResults` - GraphAI実行結果保存
  - `initFromGraphData()` - GraphDataから初期化
  - `graphData` computed - GraphDataへの変換
  - `nestedGraphs` - ネストグラフ（GraphAI機能）

## 分離戦略

### アプローチ: Plugin Architecture

汎用的なグラフエディタコアを作成し、GraphAI固有機能をプラグインとして分離します。

```
@grapys/graph-editor (Core)
  ↑
  | provides plugin interface
  |
grapys-vue (GraphAI Application)
  - uses @grapys/graph-editor
  - adds GraphAI-specific plugins
```

### Phase 1: Core Graph Editor Package

#### パッケージ構成

```
packages/graph-editor/
├── src/
│   ├── components/
│   │   ├── GraphCanvas.vue         # 汎用化
│   │   ├── BaseNode.vue            # Node2.vueベース（汎用化）
│   │   ├── Edge.vue                # そのまま
│   │   ├── ContextNodeMenu.vue     # 汎用化
│   │   └── ContextEdgeMenu.vue     # 汎用化
│   ├── composables/
│   │   ├── useNewEdge.ts           # 汎用化
│   │   └── usePanAndScroll.ts      # そのまま
│   ├── store/
│   │   └── graphStore.ts           # 汎用化（GraphAI依存削除）
│   ├── types/
│   │   └── index.ts                # GraphAI型を削除
│   ├── utils/
│   │   ├── position.ts
│   │   ├── edge.ts
│   │   └── classUtils.ts
│   └── index.ts
├── package.json
└── README.md
```

#### Core型定義（GraphAI非依存）

```typescript
// packages/graph-editor/src/types/index.ts

export type NodeProfile = {
  id: string;                       // プロファイルID
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  category?: string;
  // GraphAI固有のagent, inputSchema, isNestedGraphなどは削除
}

export type PortDefinition = {
  name: string;
  type?: string;                    // 任意の型文字列
}

export type GUINodeData = {
  type: string;                     // "computed" | "static" など拡張可能
  nodeId: string;
  position: NodePositionData;
  data: Record<string, unknown>;    // 完全に汎用的
  profile?: NodeProfile;            // プロファイル情報
}

export type GUIEdgeData = {
  type: string;                     // "edge" など拡張可能
  source: EdgeEndPointData;
  target: EdgeEndPointData;
}

// その他の型はそのまま
```

#### Core Store（GraphAI非依存）

```typescript
// packages/graph-editor/src/store/graphStore.ts

export const useGraphStore = defineStore("graphEditor", () => {
  const histories = ref<HistoryData[]>([]);
  const currentData = ref<HistoryPayload>({
    nodes: [],
    edges: [],
    metadata: {},                   // 汎用メタデータ
  });

  // GraphAI固有を削除:
  // - graphAIResults
  // - initFromGraphData()
  // - graphData computed
  // - nestedGraphs
  // - loop (オプション機能へ)

  // プラグイン用フック
  const plugins = ref<GraphEditorPlugin[]>([]);

  const registerPlugin = (plugin: GraphEditorPlugin) => {
    plugins.value.push(plugin);
  };

  // ノード/エッジ操作は保持
  return {
    nodes,
    edges,
    pushNode,
    deleteNode,
    pushEdge,
    deleteEdge,
    updateNodePosition,
    // ...

    // プラグインAPI
    registerPlugin,
    plugins,
  };
});
```

#### Plugin Interface

```typescript
// packages/graph-editor/src/types/plugin.ts

export interface GraphEditorPlugin {
  name: string;
  version: string;

  // ライフサイクルフック
  onInit?(): void;
  onNodeAdd?(node: GUINodeData): void;
  onNodeUpdate?(nodeId: string, data: Partial<GUINodeData>): void;
  onNodeDelete?(nodeId: string): void;
  onEdgeAdd?(edge: GUIEdgeData): void;
  onEdgeDelete?(edgeId: string): void;

  // データ変換フック
  exportData?(): unknown;
  importData?(data: unknown): { nodes: GUINodeData[], edges: GUIEdgeData[] };

  // バリデーション
  validateEdge?(source: EdgeEndPointData, target: EdgeEndPointData): boolean;

  // UI拡張
  nodeSlots?: {
    header?: Component;
    body?: Component;
    footer?: Component;
  };
}
```

### Phase 2: GraphAI Plugin

#### パッケージ構成

```
packages/grapys-vue/
├── src/
│   ├── plugins/
│   │   └── graphai/
│   │       ├── index.ts                 # GraphAIPlugin
│   │       ├── graphDataConverter.ts    # graph.ts相当
│   │       ├── agentProfiles.ts         # data.ts相当
│   │       ├── components/
│   │       │   ├── NodeStaticValue.vue
│   │       │   ├── NodeComputedParams.vue
│   │       │   └── NodeResult.vue
│   │       └── store/
│   │           └── graphaiStore.ts      # GraphAI固有store
│   ├── views/
│   │   ├── GUI.vue                      # Coreを使用
│   │   ├── AddNode.vue                  # GraphAI対応版
│   │   └── GraphRunner.vue              # GraphAI実行
│   └── main.ts
```

#### GraphAI Plugin実装

```typescript
// packages/grapys-vue/src/plugins/graphai/index.ts

import { GraphEditorPlugin } from '@grapys/graph-editor';
import { store2graphData, graphToGUIData } from './graphDataConverter';
import { agentProfiles } from './agentProfiles';
import NodeStaticValue from './components/NodeStaticValue.vue';
import NodeComputedParams from './components/NodeComputedParams.vue';
import NodeResult from './components/NodeResult.vue';

export const createGraphAIPlugin = (): GraphEditorPlugin => {
  return {
    name: 'graphai',
    version: '1.0.0',

    // GraphData変換
    exportData() {
      const store = useGraphStore();
      return store2graphData(store.currentData, nestedGraphs);
    },

    importData(graphData: GraphData) {
      return graphToGUIData(graphData);
    },

    // エッジバリデーション（GraphAI固有ルール）
    validateEdge(source, target) {
      // isEdgeConnectable相当のロジック
      return true;
    },

    // ノードスロット（GraphAI固有UI）
    nodeSlots: {
      body: defineComponent({
        setup(props) {
          const node = props.node as GUINodeData;
          if (node.type === 'static') {
            return () => h(NodeStaticValue, { nodeData: node });
          } else {
            return () => h(NodeComputedParams, { nodeData: node });
          }
        }
      }),
      footer: NodeResult,
    },

    // ライフサイクル
    onInit() {
      // GraphAI固有の初期化
      const graphaiStore = useGraphAIStore();
      graphaiStore.init();
    },
  };
};
```

#### GraphAI固有Store

```typescript
// packages/grapys-vue/src/plugins/graphai/store/graphaiStore.ts

export const useGraphAIStore = defineStore('graphai', () => {
  const graphAIResults = ref<Record<string, unknown>>({});
  const nestedGraphs = ref<NestedGraphList>([]);

  const setResult = (nodeId: string, result: unknown) => {
    graphAIResults.value[nodeId] = result;
  };

  return {
    graphAIResults,
    nestedGraphs,
    setResult,
  };
});
```

### Phase 3: Integration

#### アプリケーション側での使用

```typescript
// packages/grapys-vue/src/main.ts

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { useGraphStore } from '@grapys/graph-editor';
import { createGraphAIPlugin } from './plugins/graphai';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// GraphAI Pluginを登録
const graphStore = useGraphStore();
const graphaiPlugin = createGraphAIPlugin();
graphStore.registerPlugin(graphaiPlugin);

app.mount('#app');
```

```vue
<!-- packages/grapys-vue/src/views/GUI.vue -->
<script setup>
import { GraphCanvas } from '@grapys/graph-editor';
import { useGraphStore } from '@grapys/graph-editor';
import GraphRunner from './GraphRunner.vue';

const store = useGraphStore();
const graphaiPlugin = store.plugins.find(p => p.name === 'graphai');

// GraphDataから初期化
const graphData = await fetchGraphData();
const { nodes, edges } = graphaiPlugin.importData(graphData);
store.loadData({ nodes, edges, metadata: {} });
</script>

<template>
  <div>
    <GraphCanvas />
    <GraphRunner />
  </div>
</template>
```

## 移行ステップ

### Step 1: Core Packageの作成（既存動作を壊さない）

1. **新規パッケージ作成**
   ```bash
   mkdir -p packages/graph-editor/src
   ```

2. **型定義のコピーと汎用化**
   - `src/utils/gui/type.ts` → `packages/graph-editor/src/types/index.ts`
   - GraphAI固有型を削除/汎用化

3. **基本コンポーネントのコピー**
   - `Node2.vue` → `BaseNode.vue`（NodeResult除去）
   - `Edge.vue` → そのまま
   - `GraphCanvas.vue` → 汎用化

4. **Composablesのコピー**
   - `useNewEdge.ts` → そのまま（型のみ調整）
   - `usePanAndScroll.ts` → そのまま

5. **Storeの作成**
   - 新規作成（GraphAI非依存）

### Step 2: Plugin Interfaceの実装

1. **Plugin型定義**
   - `packages/graph-editor/src/types/plugin.ts`

2. **Store にプラグイン機構追加**
   - `registerPlugin()`, hooks呼び出し

### Step 3: GraphAI Pluginの作成

1. **プラグインディレクトリ作成**
   ```bash
   mkdir -p src/plugins/graphai
   ```

2. **既存コードの移行**
   - `src/utils/gui/graph.ts` → `plugins/graphai/graphDataConverter.ts`
   - `src/utils/gui/data.ts` → `plugins/graphai/agentProfiles.ts`
   - `src/views/NodeStaticValue.vue` → `plugins/graphai/components/`
   - `src/views/NodeComputedParams.vue` → `plugins/graphai/components/`
   - `src/views/NodeResult.vue` → `plugins/graphai/components/`

3. **GraphAI固有Storeの作成**
   - `graphAIResults`, `nestedGraphs` を分離

### Step 4: 既存アプリの更新

1. **依存関係の変更**
   ```json
   {
     "dependencies": {
       "@grapys/graph-editor": "workspace:*"
     }
   }
   ```

2. **コンポーネントのインポート変更**
   ```typescript
   // Before
   import GraphCanvas from './views/GraphCanvas.vue';

   // After
   import { GraphCanvas } from '@grapys/graph-editor';
   ```

3. **Store使用箇所の更新**
   ```typescript
   // Before
   import { useStore } from '../store';

   // After
   import { useGraphStore } from '@grapys/graph-editor';
   import { useGraphAIStore } from './plugins/graphai/store';
   ```

### Step 5: テストと検証

1. **既存機能の動作確認**
   - ノード追加/削除
   - エッジ作成/削除
   - ドラッグ&ドロップ
   - Undo/Redo
   - GraphAI実行

2. **パフォーマンス確認**
   - プラグイン機構のオーバーヘッド確認

## 互換性維持のポイント

### 1. Node.vueの保持

既存のNode.vueは当面保持し、GraphAI用途で使用:

```vue
<!-- src/views/Node.vue -->
<script>
import { BaseNode } from '@grapys/graph-editor';
import NodeStaticValue from './plugins/graphai/components/NodeStaticValue.vue';
import NodeComputedParams from './plugins/graphai/components/NodeComputedParams.vue';
import NodeResult from './plugins/graphai/components/NodeResult.vue';

// BaseNodeを拡張してGraphAI固有機能を追加
</script>

<template>
  <BaseNode v-bind="$props" v-on="$listeners">
    <template #body>
      <NodeStaticValue v-if="nodeData.type === 'static'" />
      <NodeComputedParams v-else />
    </template>
    <template #footer>
      <NodeResult />
    </template>
  </BaseNode>
</template>
```

### 2. Store統合

Core StoreとGraphAI Storeを統合的に使用:

```typescript
// src/composables/useIntegratedStore.ts

export const useIntegratedStore = () => {
  const coreStore = useGraphStore();
  const graphaiStore = useGraphAIStore();

  // 既存のAPIと互換性を保つラッパー
  return {
    // Core
    nodes: coreStore.nodes,
    edges: coreStore.edges,
    pushNode: coreStore.pushNode,
    // ...

    // GraphAI
    graphAIResults: graphaiStore.graphAIResults,
    nestedGraphs: graphaiStore.nestedGraphs,

    // 統合API
    graphData: computed(() => {
      const plugin = coreStore.plugins.find(p => p.name === 'graphai');
      return plugin?.exportData();
    }),
  };
};
```

### 3. 段階的移行

全ファイルを一度に変更せず、段階的に移行:

**Phase A**: Core Package作成（既存コードはそのまま）
**Phase B**: Plugin作成（既存コードはそのまま）
**Phase C**: 新規コンポーネントでCore+Plugin使用
**Phase D**: 既存コンポーネントを徐々に置き換え

## メリット

### 1. 既存機能の完全保持
- すべてのGraphAI機能が動作
- データ構造はそのまま
- UI/UXに変更なし

### 2. 再利用性
- Coreパッケージは他のグラフアプリケーションで再利用可能
- プラグインアーキテクチャで拡張容易

### 3. メンテナンス性
- 関心の分離（Core vs GraphAI）
- 依存関係の明確化
- テストの分離

### 4. 将来の拡張性
- 他のワークフローエンジンプラグイン追加可能
- カスタムノードタイプ追加容易

## 完全分離可能性の結論

**YES、完全に分離可能です。**

以下の理由から:

1. **Node2.vueの存在**: すでにGraphAI固有機能を削除したノードコンポーネントが存在
2. **明確な境界**: GraphAI固有機能は特定ファイル（graph.ts、data.ts、NodeResult等）に集中
3. **型の独立性**: Core型定義はGraphAI型から分離可能
4. **Plugin Architecture**: プラグイン機構で既存機能を完全に再現可能

唯一の懸念は移行作業量ですが、段階的移行により既存動作を壊さずに実施できます。
