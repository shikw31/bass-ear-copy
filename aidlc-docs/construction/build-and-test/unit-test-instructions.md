# Unit Test Execution

## Unit 1: Frontend Web App

### 1. Execute All Unit Tests
```bash
cd frontend
npm test
```

### 2. Review Test Results
- **Expected**: 14テストファイル / 50テスト全て成功（Unit 1のみ。Unit 2 Functional Design中に追加した`syncOrchestrationService.test.ts`を含む）
- **Test Report Location**: ターミナル出力（Vitestのデフォルトレポーター）

### 3. Fix Failing Tests
失敗した場合:
1. ターミナルの失敗テスト名・アサーション差分を確認する
2. 対応する`src/`配下の実装を確認する
3. 修正後、再度`npm test`を実行する

## Unit 2: Backend Sync API

### 1. Execute All Unit Tests
```bash
cd backend
npm test
```

### 2. Review Test Results
- **Expected**: 9テストファイル / 31テスト全て成功
- **Test Report Location**: ターミナル出力

### 3. Fix Failing Tests
Unit 1と同様の手順。特にストア層のテストは`tests/stores/fakeRedis.ts`のインメモリフェイクを使っているため、実際のUpstash Redis接続は不要

## 依存関係の脆弱性チェック（SECURITY-10）
両Unitとも以下を定期的に実行し、0件であることを確認する:
```bash
npm audit
```
- **検証済み**: 2026-10-17時点で両Unitとも0件の脆弱性
