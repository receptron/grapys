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
