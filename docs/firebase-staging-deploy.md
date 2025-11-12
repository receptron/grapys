# Firebase プレビューデプロイ運用メモ

このドキュメントは、`.github/workflows/deploy-preview.yml` のセットアップ手順と運用ルールをまとめたものです。
Pull Request の更新に合わせて Firebase Hosting のプレビューURLを自動生成・更新し、レビュアーが常に最新の検証環境を確認できるようにします。

## ワークフローの概要

- **ワークフローファイル**: `.github/workflows/deploy-preview.yml`
- **トリガー**: PR の作成・更新・ラベル付与時 (`opened`, `synchronize`, `reopened`, `labeled`)
- **デプロイ対象**: `packages/grapys-vue`

### 主な処理

1. `packages/grapys-vue` ディレクトリで `yarn install` を実行し、依存関係をインストールします。
2. `packages/grapys-vue/src/config` ディレクトリに、設定ファイル `project.ts` のシンボリックリンクを作成します。
3. `packages/grapys-vue` ディレクトリで `yarn build` を実行します。
4. `FirebaseExtended/action-hosting-deploy` を使用し、PR番号に基づいたプレビューチャンネル (`pr-<PR番号>`) へデプロイします（有効期限7日）。
5. デプロイ完了後、プレビューURLがPRに自動でコメントされます。

### 制御

- `no-preview` ラベルが付いているPRはデプロイをスキップします。
- 同じPR内での再実行は、古いジョブをキャンセルし、常に最新のコミットのみをデプロイします。

## セットアップ手順

### 1. GitHub Secrets の設定

リポジトリの `Settings > Secrets and variables > Actions` で、以下のシークレットを登録します。

- **`FIREBASE_SERVICE_ACCOUNT`**: FirebaseプロジェクトのサービスアカウントのJSONキー。
  - **権限**: `Firebase Hosting Admin` ロールが必要です。
- **`FIREBASE_PROJECT_ID`**: デプロイ先のFirebaseプロジェクトID。

### 2. ワークフローの権限

ワークフローファイル (`deploy-preview.yml`) の `permissions` セクションには、以下の権限が必要です。

```yaml
permissions:
  contents: read
  pull-requests: write   # PRへのコメント投稿に必要
  checks: write          # デプロイアクションのCheck Run作成に必要
  id-token: write        # (将来的なWIF認証用)
```

### 3. firebase.json の確認

このワークフローは、`packages/grapys-vue/firebase.json` に定義されたデフォルトのホスティング設定を使用します。特定の `target` は指定していません。

## 運用フロー

1. 開発者がPRを作成または更新すると、ワークフローが自動的に実行されます。
2. デプロイが完了すると、アクションがPRにプレビューURLをコメントします。同じPRで再度デプロイが行われた場合、コメントは更新されます。
3. プレビューは7日後に自動で失効します。

この運用により、PRごとに自動生成されるプレビュー環境を用いて、レビューサイクルを高速化できます。
