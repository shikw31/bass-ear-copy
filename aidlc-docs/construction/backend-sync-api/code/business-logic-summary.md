# Business Logic Summary: Backend Sync API

## 生成されたファイル（`backend/src/`）
- `domain/types.ts` — domain-entities.md準拠の型定義（User, Session, SongRecord）
- `logic/passwordHash.ts` — bcryptjsラッパー（hash/verify、SECURITY-12準拠のアダプティブアルゴリズム）
- `logic/session.ts` — セッション有効期限計算、30日スライディング延長
- `logic/songConflict.ts` — サーバー側Last-Write-Wins判定（`shouldAcceptWrite`）
- `logic/validation.ts` — zodスキーマ（songKey形式、メモ長、ループ区間、ログイン資格情報）

## テスト（`backend/tests/logic/`）
Vitest + fast-check（PBT-09準拠）。Functional DesignのPBT-01 Property識別表に対応。

| テストファイル | 検証内容 |
|---|---|
| passwordHash.test.ts | ハッシュ検証の往復性（PBT-02）、誤ったパスワードでの検証失敗 |
| session.test.ts | 期限切れ判定の不変条件（PBT-03）、スライディング延長の不変条件・冪等性（PBT-04） |
| songConflict.test.ts | サーバー側LWWの不変条件（PBT-03）・冪等性（PBT-04） |
| validation.test.ts | songKey/メモ/ループ区間/ログイン資格情報のスキーマ検証（例示ベース） |

## 既知の制約
- bcryptjsのPBTテストは意図的に実行回数を少なく抑えている（ハッシュ計算が遅いため、`numRuns: 5`）
