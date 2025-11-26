# VueWeave

ドラッグ&ドロップ機能を備えたビジュアルノードベースのグラフエディタを構築するための Vue 3 コンポーネントライブラリです。

## 機能

- 🎯 **ノードベースのグラフエディタ**: インタラクティブなビジュアルプログラミングインターフェースを構築
- 🎨 **カスタマイズ可能なコンポーネント**: ノードとキャンバス用の柔軟なベースコンポーネント
- 🔗 **エッジ接続**: ノード間のビジュアル接続とバリデーション
- 📦 **TypeScript サポート**: 完全な型定義を含む
- 💅 **Tailwind CSS でスタイリング**: Tailwind v4 でビルド済みのスタイル

## インストール

```bash
npm install vueweave
# または
yarn add vueweave
```

## 使い方

### 1. CSS のインポート

まず、アプリケーションのエントリーポイント（例: `main.ts`）で VueWeave のスタイルをインポートします：

```typescript
import "vueweave/style.css";
```

### 2. 基本的なセットアップ

VueWeave は主に2つのコンポーネントを提供します：`GraphCanvasBase` と `NodeBase`。

#### キャンバスのセットアップ

```vue
<template>
  <GraphCanvasBase
    :nodes="nodes"
    :edges="edges"
    :node-records="nodeRecords"
    :update-position="updateNodePosition"
    :save-position="saveNodePosition"
    :validate-connection="validateConnection"
  >
    <template #node="{ nodeData, nodeIndex }">
      <NodeBase
        :inputs="nodeData.inputs"
        :outputs="nodeData.outputs"
        @open-node-edit-menu="handleOpenMenu"
      >
        <template #header="{ nodeData }">
          <div>{{ nodeData.name }}</div>
        </template>
        <template #body-main>
          <!-- ここにノードのコンテンツを配置 -->
        </template>
      </NodeBase>
    </template>
  </GraphCanvasBase>
</template>

<script setup lang="ts">
import { GraphCanvasBase, NodeBase, useFlowStore } from 'vueweave';

const store = useFlowStore();
const nodes = store.nodes;
const edges = store.edges;
const nodeRecords = store.nodeRecords;

function updateNodePosition(index: number, position: any) {
  store.updateNodePosition(index, position);
}

function saveNodePosition() {
  store.savePosition();
}

function validateConnection(edge: any) {
  // バリデーションロジック
  return true;
}

function handleOpenMenu(event: MouseEvent) {
  // ノードメニューを開く処理
}
</script>
```

### 3. ストアの使用

VueWeave にはグラフの状態を管理するための Pinia ストアが含まれています：

```typescript
import { useFlowStore } from 'vueweave';

const flowStore = useFlowStore();

// ノードとエッジへのアクセス
const nodes = flowStore.nodes;
const edges = flowStore.edges;

// ノード位置の更新
flowStore.updateNodePosition(index, position);

// エッジの追加/削除
flowStore.addEdge(edge);
flowStore.removeEdge(edgeId);
```

## サンプル

VueWeave には様々な機能を実証するサンプルが含まれています：

### Validation Example

Validation Example（`/validation` ルート）は、異なるノードタイプでのカスタムエッジ接続検証を実演します：

- **singleInput**: 全ポートを通じて1つの入力のみ許可
- **onePerPort**: 各ポートに1つの入力（複数ポートへの同時接続OK）
- **multiple**: 同じポートへの無制限の入力を許可
- **typeA / typeB**: タイプマッチング - 同じタイプのみ受け入れ、複数接続OK
- **output**: 任意の入力タイプを受け入れ

各ノードはノードUI内に検証ルールと動作を直接表示するため、開発者がカスタム検証の動作を理解しやすくなっています。

```typescript
// カスタム検証関数の例
const validateConnection = (expectEdge: GUIEdgeData, existingEdges: GUIEdgeData[]): boolean => {
  const sourceNode = store.nodes.find((n) => n.nodeId === expectEdge.source.nodeId);
  const targetNode = store.nodes.find((n) => n.nodeId === expectEdge.target.nodeId);

  // ルール1: Single inputノード - 全体で1つの接続のみ
  if (targetNode.type === "singleInput") {
    const allEdgesToThisNode = store.edges.filter((edge) => edge.target.nodeId === expectEdge.target.nodeId);
    return allEdgesToThisNode.length === 0;
  }

  // ルール2: タイプマッチング
  if (sourceNode.type === "typeA" || sourceNode.type === "typeB") {
    if (targetNode.type !== "output" && sourceNode.type !== targetNode.type) {
      return false; // タイプ不一致
    }
    return true; // 複数接続OK
  }

  return true;
};
```

## コンポーネント

### GraphCanvasBase

グラフをレンダリングするためのメインキャンバスコンポーネント。

**Props:**
- `nodes`: ノードデータの配列
- `edges`: エッジ接続の配列
- `nodeRecords`: ノードの位置とメタデータのレコード
- `updatePosition`: ノード位置を更新する関数
- `savePosition`: 位置を保存する関数
- `validateConnection`: エッジ接続をバリデートする関数

**スロット:**
- `head`: キャンバスの上部にレンダリングするコンテンツ
- `node`: ノードテンプレート（`nodeData` と `nodeIndex` を受け取る）

### NodeBase

個別のノード用のベースコンポーネント。

**Props:**
- `inputs`: 入力ポートの配列 `{ name: string, key?: string }[]`
- `outputs`: 出力ポートの配列 `{ name: string }[]`

**イベント:**
- `openNodeEditMenu`: ノードがクリックされた時に発火

**スロット:**
- `header`: ノードヘッダーのコンテンツ
- `body-head`: ノード本体の上部コンテンツ
- `body-main`: ノード本体のメインコンテンツ

## ユーティリティ

### クラスユーティリティ

VueWeave はノードのスタイリング用のユーティリティ関数を提供します：

```typescript
import {
  nodeMainClass,
  nodeHeaderClass,
  nodeOutputClass,
  nodeInputClass,
  buttonColorVariants,
  edgeColors
} from 'vueweave';
```

### 型定義

```typescript
import type {
  GUINodeData,
  GUIEdgeData,
  NodePosition,
  InputOutputData
} from 'vueweave';
```

## 開発

### パッケージのビルド

```bash
# アプリケーションをビルド
npm run build

# 配布用のパッケージをビルド
npm run build:module
```

以下が生成されます：
- `lib/package/` 内の JavaScript ファイル
- `lib/package/` 内の型定義ファイル（`.d.ts`）
- `lib/package/style.css` の CSS バンドル

### プロジェクト構成

```
vueweave/
├── src/
│   ├── package/          # パッケージのソースコード
│   │   ├── components/   # Vue コンポーネント
│   │   ├── composable/   # Composables
│   │   ├── store/        # Pinia ストア
│   │   ├── utils/        # ユーティリティ関数
│   │   ├── index.ts      # メインエントリーポイント
│   │   └── style.css     # スタイル
│   └── ...               # アプリケーションコード
├── lib/                  # ビルド出力
└── package.json
```

## ライセンス

MIT

## コントリビューション

コントリビューションを歓迎します！お気軽にプルリクエストを送信してください。
