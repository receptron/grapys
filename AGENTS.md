# Repository Guidelines

## プロジェクト構成 / モジュール
- Yarn Workspaces によるモノレポ構成。
- メインパッケージは `packages/grapys-vue`（Vue 3）。エージェント/グラフの中核は `src/agents` と `src/graph`、共通処理は `src/utils`。
- `packages/grapys-react` は `grapys-vue` のロジックをシンボリックリンクで再利用。共有ロジックの修正は必ず `grapys-vue` 側で行います。
- ルートの `tests/` に TypeScript の結合/ユニットテスト（`test_*.ts`）。
- CI 設定は `.github/workflows/`、ドキュメントは `docs/`。

## ビルド・テスト・開発
- ルートスクリプト:
  - `yarn install`: 依存関係のインストール。
  - `yarn build`: 全ワークスペースをビルド。
  - `yarn test`: `tsx --test ./tests/test_*.ts` を実行。
  - `yarn lint` / `yarn format`: ESLint / Prettier を各パッケージで実行。
- パッケージ単位:
  - `yarn workspace grapys-vue dev`（または `grapys-react dev`）: Vite 開発サーバ起動。
  - `yarn workspace <pkg> build|preview|lint|format`: 各種タスク。
- ローカル設定: `project.ts` をサンプルから作成
  - `cp packages/grapys-vue/src/config/game-dev.ts packages/grapys-vue/src/config/project.ts`

## コーディング規約 / 命名
- 言語: TypeScript, Vue 3, React 19。
- 整形: 2 スペース、Prettier。静的解析: ESLint（各パッケージ設定を尊重）。
- 命名: コンポーネントは PascalCase（`MyPanel.vue`, `App.tsx`）、ユーティリティは camelCase、定数は SCREAMING_SNAKE_CASE。
- テストファイルは `tests/test_*.ts`。PR 前に `yarn lint` / `yarn format` 実行。

## テストガイドライン
- ランナー: Node の `node:test` + `assert` を `tsx` で実行。
- 配置: ルート `tests/`（例: `tests/test_results.ts`）。
- 実行: `yarn test`。テストは決定的で小さく、外部依存を避けること。カバレッジ必須条件は現状なし。

## コミット / PR
- コミット規約: Conventional Commits（例: `feat:`, `fix:`, `chore:`）。短く命令形で、必要に応じてスコープを付与。
- PR 要件: 説明、関連 Issue のリンク、UI 変更はスクリーンショット、設定変更の影響を明記。
- チェック: `yarn build && yarn lint && yarn test` をローカルで通過。PR 作成時は `grapys-vue` が Firebase Hosting にプレビュー展開（スキップは `no-preview` ラベル）。

## セキュリティ / 設定の注意
- 秘密情報はコミットしない（`.env` は Git 追跡外）。
- Node 20+ を推奨（CI は 20/22）。パッケージ管理は Yarn（v1）を使用。
- `grapys-react` のシンボリックリンク配下は直接編集せず、必ず `grapys-vue` 側を更新。
