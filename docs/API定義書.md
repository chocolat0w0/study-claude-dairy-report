# 営業日報システム API定義書

## 1. API概要

### 1.1 基本情報

- ベースURL: `https://api.example.com/v1`
- プロトコル: HTTPS
- データ形式: JSON
- 文字エンコーディング: UTF-8
- 日時形式: ISO 8601 (例: `2024-01-31T15:30:00Z`)

### 1.2 APIバージョン

| バージョン | リリース日 | ステータス | 備考         |
| ---------- | ---------- | ---------- | ------------ |
| v1         | TBD        | 開発中     | 初回リリース |

---

## 2. 認証・認可

### 2.1 認証方式

セッションベース認証を使用

- ログイン成功時にセッションIDをCookieに保存
- 以降のリクエストでセッションIDを自動送信
- セッションタイムアウト: 30分（アクティビティがない場合）

### 2.2 認証フロー

1. クライアントが `/auth/login` にメールアドレスとパスワードをPOST
2. サーバーが認証情報を検証
3. 認証成功時、セッションIDをCookieにセット
4. クライアントは以降のリクエストで自動的にセッションIDを送信
5. ログアウト時は `/auth/logout` にPOST

### 2.3 権限レベル

| 役割   | role    | 説明                                 |
| ------ | ------- | ------------------------------------ |
| 営業   | sales   | 自分の日報のみ作成・編集可能         |
| 上長   | manager | 配下の営業の日報を閲覧・コメント可能 |
| 管理者 | admin   | ユーザーマスタ管理が可能             |

---

## 3. 共通仕様

### 3.1 リクエストヘッダー

| ヘッダー名   | 必須 | 値               | 説明                   |
| ------------ | ---- | ---------------- | ---------------------- |
| Content-Type | ○    | application/json | リクエストボディの形式 |
| Accept       | ○    | application/json | レスポンスボディの形式 |

### 3.2 レスポンス形式

#### 成功時（2xx）

```json
{
  "success": true,
  "data": {
    // レスポンスデータ
  },
  "message": "操作が成功しました"
}
```

#### エラー時（4xx, 5xx）

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": {
      // エラーの詳細情報（任意）
    }
  }
}
```

### 3.3 HTTPステータスコード

| コード | 説明                  | 使用場面                               |
| ------ | --------------------- | -------------------------------------- |
| 200    | OK                    | リクエスト成功                         |
| 201    | Created               | リソース作成成功                       |
| 204    | No Content            | リクエスト成功（レスポンスボディなし） |
| 400    | Bad Request           | リクエストパラメータ不正               |
| 401    | Unauthorized          | 認証が必要                             |
| 403    | Forbidden             | 権限なし                               |
| 404    | Not Found             | リソースが見つからない                 |
| 409    | Conflict              | リソースの競合（重複など）             |
| 422    | Unprocessable Entity  | バリデーションエラー                   |
| 500    | Internal Server Error | サーバー内部エラー                     |

### 3.4 エラーコード

| コード           | HTTPステータス | 説明                   |
| ---------------- | -------------- | ---------------------- |
| VALIDATION_ERROR | 422            | 入力値が不正           |
| UNAUTHORIZED     | 401            | 認証が必要             |
| FORBIDDEN        | 403            | アクセス権限がない     |
| NOT_FOUND        | 404            | リソースが見つからない |
| DUPLICATE_ENTRY  | 409            | データが重複している   |
| INTERNAL_ERROR   | 500            | サーバー内部エラー     |

### 3.5 ページネーション

リスト取得APIでは以下のクエリパラメータでページネーションをサポート

| パラメータ | 型      | デフォルト | 説明                           |
| ---------- | ------- | ---------- | ------------------------------ |
| page       | integer | 1          | ページ番号（1から開始）        |
| per_page   | integer | 20         | 1ページあたりの件数（最大100） |

レスポンス例：

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_items": 100,
      "total_pages": 5,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

---

## 4. エンドポイント一覧

### 4.1 認証

| メソッド | エンドポイント | 説明                   | 認証 |
| -------- | -------------- | ---------------------- | ---- |
| POST     | /auth/login    | ログイン               | 不要 |
| POST     | /auth/logout   | ログアウト             | 必要 |
| GET      | /auth/me       | 現在のユーザー情報取得 | 必要 |

### 4.2 日報

| メソッド | エンドポイント     | 説明         | 認証 |
| -------- | ------------------ | ------------ | ---- |
| GET      | /daily-reports     | 日報一覧取得 | 必要 |
| GET      | /daily-reports/:id | 日報詳細取得 | 必要 |
| POST     | /daily-reports     | 日報作成     | 必要 |
| PUT      | /daily-reports/:id | 日報更新     | 必要 |
| DELETE   | /daily-reports/:id | 日報削除     | 必要 |

### 4.3 訪問記録

| メソッド | エンドポイント                             | 説明             | 認証 |
| -------- | ------------------------------------------ | ---------------- | ---- |
| GET      | /daily-reports/:daily_report_id/visits     | 訪問記録一覧取得 | 必要 |
| POST     | /daily-reports/:daily_report_id/visits     | 訪問記録作成     | 必要 |
| PUT      | /daily-reports/:daily_report_id/visits/:id | 訪問記録更新     | 必要 |
| DELETE   | /daily-reports/:daily_report_id/visits/:id | 訪問記録削除     | 必要 |

### 4.4 コメント

| メソッド | エンドポイント                               | 説明             | 認証 |
| -------- | -------------------------------------------- | ---------------- | ---- |
| GET      | /daily-reports/:daily_report_id/comments     | コメント一覧取得 | 必要 |
| POST     | /daily-reports/:daily_report_id/comments     | コメント投稿     | 必要 |
| PUT      | /daily-reports/:daily_report_id/comments/:id | コメント更新     | 必要 |
| DELETE   | /daily-reports/:daily_report_id/comments/:id | コメント削除     | 必要 |

### 4.5 顧客マスタ

| メソッド | エンドポイント | 説明         | 認証 |
| -------- | -------------- | ------------ | ---- |
| GET      | /customers     | 顧客一覧取得 | 必要 |
| GET      | /customers/:id | 顧客詳細取得 | 必要 |
| POST     | /customers     | 顧客作成     | 必要 |
| PUT      | /customers/:id | 顧客更新     | 必要 |
| DELETE   | /customers/:id | 顧客削除     | 必要 |

### 4.6 ユーザーマスタ

| メソッド | エンドポイント | 説明             | 認証               |
| -------- | -------------- | ---------------- | ------------------ |
| GET      | /users         | ユーザー一覧取得 | 必要（管理者のみ） |
| GET      | /users/:id     | ユーザー詳細取得 | 必要（管理者のみ） |
| POST     | /users         | ユーザー作成     | 必要（管理者のみ） |
| PUT      | /users/:id     | ユーザー更新     | 必要（管理者のみ） |
| DELETE   | /users/:id     | ユーザー削除     | 必要（管理者のみ） |

---

## 5. API詳細仕様

### 5.1 認証API

#### POST /auth/login

ユーザーログイン

**リクエスト**

```json
{
  "email": "tanaka@example.com",
  "password": "password123"
}
```

**レスポンス（200 OK）**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "田中太郎",
      "email": "tanaka@example.com",
      "role": "sales",
      "department": "営業1課",
      "manager_id": 2
    }
  },
  "message": "ログインに成功しました"
}
```

**エラーレスポンス（401 Unauthorized）**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "メールアドレスまたはパスワードが間違っています"
  }
}
```

#### POST /auth/logout

ユーザーログアウト

**リクエスト**

リクエストボディなし

**レスポンス（204 No Content）**

レスポンスボディなし

#### GET /auth/me

現在のユーザー情報取得

**レスポンス（200 OK）**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "田中太郎",
    "email": "tanaka@example.com",
    "role": "sales",
    "department": "営業1課",
    "manager_id": 2,
    "manager_name": "佐藤部長"
  }
}
```

---

### 5.2 日報API

#### GET /daily-reports

日報一覧取得

**クエリパラメータ**

| パラメータ | 型      | 必須 | 説明                         |
| ---------- | ------- | ---- | ---------------------------- |
| start_date | date    | -    | 検索開始日（YYYY-MM-DD）     |
| end_date   | date    | -    | 検索終了日（YYYY-MM-DD）     |
| user_id    | integer | -    | ユーザーID（上長のみ指定可） |
| page       | integer | -    | ページ番号                   |
| per_page   | integer | -    | 1ページあたりの件数          |

**レスポンス（200 OK）**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "user_id": 1,
        "user_name": "田中太郎",
        "report_date": "2024-01-31",
        "visit_count": 3,
        "comment_count": 2,
        "is_editable": true,
        "created_at": "2024-01-31T18:30:00Z",
        "updated_at": "2024-01-31T19:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_items": 50,
      "total_pages": 3,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### GET /daily-reports/:id

日報詳細取得

**パスパラメータ**

| パラメータ | 型      | 説明   |
| ---------- | ------- | ------ |
| id         | integer | 日報ID |

**レスポンス（200 OK）**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "user_name": "田中太郎",
    "report_date": "2024-01-31",
    "problem": "株式会社ABCの決裁者へのアポが取れない。",
    "plan": "- 株式会社DEFへの提案書作成\n- 株式会社GHIへのフォローコール",
    "visit_records": [
      {
        "id": 1,
        "customer_id": 10,
        "customer_name": "山田太郎",
        "company_name": "株式会社ABC",
        "visit_content": "新商品の提案を実施。\n次回アポイント: 2/15",
        "visit_order": 1
      },
      {
        "id": 2,
        "customer_id": 20,
        "customer_name": "鈴木花子",
        "company_name": "株式会社XYZ",
        "visit_content": "契約更新の打ち合わせ",
        "visit_order": 2
      }
    ],
    "comments": [
      {
        "id": 1,
        "commenter_id": 2,
        "commenter_name": "佐藤部長",
        "content": "株式会社ABCについては、私から決裁者にコンタクトを取ってみます。",
        "created_at": "2024-01-31T20:30:00Z",
        "updated_at": "2024-01-31T20:30:00Z"
      }
    ],
    "is_editable": true,
    "created_at": "2024-01-31T18:30:00Z",
    "updated_at": "2024-01-31T19:00:00Z"
  }
}
```

**エラーレスポンス（404 Not Found）**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "日報が見つかりません"
  }
}
```

**エラーレスポンス（403 Forbidden）**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "この日報にアクセスする権限がありません"
  }
}
```

#### POST /daily-reports

日報作成

**リクエスト**

```json
{
  "report_date": "2024-01-31",
  "problem": "株式会社ABCの決裁者へのアポが取れない。",
  "plan": "- 株式会社DEFへの提案書作成\n- 株式会社GHIへのフォローコール",
  "visit_records": [
    {
      "customer_id": 10,
      "visit_content": "新商品の提案を実施。\n次回アポイント: 2/15",
      "visit_order": 1
    },
    {
      "customer_id": 20,
      "visit_content": "契約更新の打ち合わせ",
      "visit_order": 2
    }
  ]
}
```

**レスポンス（201 Created）**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "report_date": "2024-01-31",
    "problem": "株式会社ABCの決裁者へのアポが取れない。",
    "plan": "- 株式会社DEFへの提案書作成\n- 株式会社GHIへのフォローコール",
    "created_at": "2024-01-31T18:30:00Z",
    "updated_at": "2024-01-31T18:30:00Z"
  },
  "message": "日報を作成しました"
}
```

**エラーレスポンス（409 Conflict）**

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_ENTRY",
    "message": "この日付の日報は既に作成されています"
  }
}
```

**エラーレスポンス（422 Unprocessable Entity）**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です",
    "details": {
      "report_date": ["未来の日付は選択できません"],
      "visit_records": ["訪問記録を少なくとも1件追加してください"]
    }
  }
}
```

#### PUT /daily-reports/:id

日報更新

**パスパラメータ**

| パラメータ | 型      | 説明   |
| ---------- | ------- | ------ |
| id         | integer | 日報ID |

**リクエスト**

```json
{
  "problem": "株式会社ABCの決裁者へのアポが取れない。（更新）",
  "plan": "- 株式会社DEFへの提案書作成\n- 株式会社GHIへのフォローコール\n- 株式会社ABCへの再アプローチ",
  "visit_records": [
    {
      "id": 1,
      "customer_id": 10,
      "visit_content": "新商品の提案を実施。\n次回アポイント: 2/15（更新）",
      "visit_order": 1
    },
    {
      "customer_id": 30,
      "visit_content": "新規顧客への訪問",
      "visit_order": 2
    }
  ]
}
```

**レスポンス（200 OK）**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "report_date": "2024-01-31",
    "problem": "株式会社ABCの決裁者へのアポが取れない。（更新）",
    "plan": "- 株式会社DEFへの提案書作成\n- 株式会社GHIへのフォローコール\n- 株式会社ABCへの再アプローチ",
    "created_at": "2024-01-31T18:30:00Z",
    "updated_at": "2024-01-31T19:30:00Z"
  },
  "message": "日報を更新しました"
}
```

**エラーレスポンス（403 Forbidden）**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "当日の日報のみ編集できます"
  }
}
```

#### DELETE /daily-reports/:id

日報削除（論理削除）

**パスパラメータ**

| パラメータ | 型      | 説明   |
| ---------- | ------- | ------ |
| id         | integer | 日報ID |

**レスポンス（204 No Content）**

レスポンスボディなし

**エラーレスポンス（403 Forbidden）**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "この日報を削除する権限がありません"
  }
}
```

---

### 5.3 訪問記録API

#### GET /daily-reports/:daily_report_id/visits

訪問記録一覧取得

**パスパラメータ**

| パラメータ      | 型      | 説明   |
| --------------- | ------- | ------ |
| daily_report_id | integer | 日報ID |

**レスポンス（200 OK）**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "daily_report_id": 1,
      "customer_id": 10,
      "customer_name": "山田太郎",
      "company_name": "株式会社ABC",
      "visit_content": "新商品の提案を実施。",
      "visit_order": 1,
      "created_at": "2024-01-31T18:30:00Z",
      "updated_at": "2024-01-31T18:30:00Z"
    }
  ]
}
```

#### POST /daily-reports/:daily_report_id/visits

訪問記録作成

**パスパラメータ**

| パラメータ      | 型      | 説明   |
| --------------- | ------- | ------ |
| daily_report_id | integer | 日報ID |

**リクエスト**

```json
{
  "customer_id": 10,
  "visit_content": "新商品の提案を実施。",
  "visit_order": 1
}
```

**レスポンス（201 Created）**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "daily_report_id": 1,
    "customer_id": 10,
    "visit_content": "新商品の提案を実施。",
    "visit_order": 1,
    "created_at": "2024-01-31T18:30:00Z",
    "updated_at": "2024-01-31T18:30:00Z"
  },
  "message": "訪問記録を作成しました"
}
```

#### PUT /daily-reports/:daily_report_id/visits/:id

訪問記録更新

**パスパラメータ**

| パラメータ      | 型      | 説明       |
| --------------- | ------- | ---------- |
| daily_report_id | integer | 日報ID     |
| id              | integer | 訪問記録ID |

**リクエスト**

```json
{
  "customer_id": 10,
  "visit_content": "新商品の提案を実施。（更新）",
  "visit_order": 1
}
```

**レスポンス（200 OK）**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "daily_report_id": 1,
    "customer_id": 10,
    "visit_content": "新商品の提案を実施。（更新）",
    "visit_order": 1,
    "created_at": "2024-01-31T18:30:00Z",
    "updated_at": "2024-01-31T19:30:00Z"
  },
  "message": "訪問記録を更新しました"
}
```

#### DELETE /daily-reports/:daily_report_id/visits/:id

訪問記録削除

**パスパラメータ**

| パラメータ      | 型      | 説明       |
| --------------- | ------- | ---------- |
| daily_report_id | integer | 日報ID     |
| id              | integer | 訪問記録ID |

**レスポンス（204 No Content）**

レスポンスボディなし

---

### 5.4 コメントAPI

#### GET /daily-reports/:daily_report_id/comments

コメント一覧取得

**パスパラメータ**

| パラメータ      | 型      | 説明   |
| --------------- | ------- | ------ |
| daily_report_id | integer | 日報ID |

**レスポンス（200 OK）**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "daily_report_id": 1,
      "commenter_id": 2,
      "commenter_name": "佐藤部長",
      "content": "株式会社ABCについては、私から決裁者にコンタクトを取ってみます。",
      "created_at": "2024-01-31T20:30:00Z",
      "updated_at": "2024-01-31T20:30:00Z",
      "is_deletable": true
    }
  ]
}
```

#### POST /daily-reports/:daily_report_id/comments

コメント投稿

**パスパラメータ**

| パラメータ      | 型      | 説明   |
| --------------- | ------- | ------ |
| daily_report_id | integer | 日報ID |

**リクエスト**

```json
{
  "content": "株式会社ABCについては、私から決裁者にコンタクトを取ってみます。"
}
```

**レスポンス（201 Created）**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "daily_report_id": 1,
    "commenter_id": 2,
    "commenter_name": "佐藤部長",
    "content": "株式会社ABCについては、私から決裁者にコンタクトを取ってみます。",
    "created_at": "2024-01-31T20:30:00Z",
    "updated_at": "2024-01-31T20:30:00Z"
  },
  "message": "コメントを投稿しました"
}
```

**エラーレスポンス（403 Forbidden）**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "コメントを投稿する権限がありません"
  }
}
```

#### PUT /daily-reports/:daily_report_id/comments/:id

コメント更新

**パスパラメータ**

| パラメータ      | 型      | 説明       |
| --------------- | ------- | ---------- |
| daily_report_id | integer | 日報ID     |
| id              | integer | コメントID |

**リクエスト**

```json
{
  "content": "株式会社ABCについては、私から決裁者にコンタクトを取ってみます。（更新）"
}
```

**レスポンス（200 OK）**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "daily_report_id": 1,
    "commenter_id": 2,
    "commenter_name": "佐藤部長",
    "content": "株式会社ABCについては、私から決裁者にコンタクトを取ってみます。（更新）",
    "created_at": "2024-01-31T20:30:00Z",
    "updated_at": "2024-01-31T21:00:00Z"
  },
  "message": "コメントを更新しました"
}
```

#### DELETE /daily-reports/:daily_report_id/comments/:id

コメント削除（論理削除）

**パスパラメータ**

| パラメータ      | 型      | 説明       |
| --------------- | ------- | ---------- |
| daily_report_id | integer | 日報ID     |
| id              | integer | コメントID |

**レスポンス（204 No Content）**

レスポンスボディなし

---

### 5.5 顧客マスタAPI

#### GET /customers

顧客一覧取得

**クエリパラメータ**

| パラメータ      | 型      | 必須 | 説明                |
| --------------- | ------- | ---- | ------------------- |
| company_name    | string  | -    | 会社名（部分一致）  |
| name            | string  | -    | 顧客名（部分一致）  |
| sales_person_id | integer | -    | 担当営業ID          |
| page            | integer | -    | ページ番号          |
| per_page        | integer | -    | 1ページあたりの件数 |

**レスポンス（200 OK）**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "山田太郎",
        "company_name": "株式会社ABC",
        "phone": "03-1234-5678",
        "email": "yamada@abc.co.jp",
        "sales_person_id": 1,
        "sales_person_name": "田中太郎"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_items": 50,
      "total_pages": 3,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### GET /customers/:id

顧客詳細取得

**パスパラメータ**

| パラメータ | 型      | 説明   |
| ---------- | ------- | ------ |
| id         | integer | 顧客ID |

**レスポンス（200 OK）**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "山田太郎",
    "company_name": "株式会社ABC",
    "address": "東京都渋谷区〇〇1-2-3",
    "phone": "03-1234-5678",
    "email": "yamada@abc.co.jp",
    "sales_person_id": 1,
    "sales_person_name": "田中太郎",
    "notes": "VIP顧客。毎月訪問必須。",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-15T14:30:00Z"
  }
}
```

#### POST /customers

顧客作成

**リクエスト**

```json
{
  "name": "山田太郎",
  "company_name": "株式会社ABC",
  "address": "東京都渋谷区〇〇1-2-3",
  "phone": "03-1234-5678",
  "email": "yamada@abc.co.jp",
  "sales_person_id": 1,
  "notes": "VIP顧客。毎月訪問必須。"
}
```

**レスポンス（201 Created）**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "山田太郎",
    "company_name": "株式会社ABC",
    "address": "東京都渋谷区〇〇1-2-3",
    "phone": "03-1234-5678",
    "email": "yamada@abc.co.jp",
    "sales_person_id": 1,
    "notes": "VIP顧客。毎月訪問必須。",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  },
  "message": "顧客を作成しました"
}
```

#### PUT /customers/:id

顧客更新

**パスパラメータ**

| パラメータ | 型      | 説明   |
| ---------- | ------- | ------ |
| id         | integer | 顧客ID |

**リクエスト**

```json
{
  "name": "山田太郎",
  "company_name": "株式会社ABC",
  "address": "東京都渋谷区〇〇1-2-3（更新）",
  "phone": "03-1234-5678",
  "email": "yamada@abc.co.jp",
  "sales_person_id": 1,
  "notes": "VIP顧客。毎月訪問必須。"
}
```

**レスポンス（200 OK）**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "山田太郎",
    "company_name": "株式会社ABC",
    "address": "東京都渋谷区〇〇1-2-3（更新）",
    "phone": "03-1234-5678",
    "email": "yamada@abc.co.jp",
    "sales_person_id": 1,
    "notes": "VIP顧客。毎月訪問必須。",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-15T14:30:00Z"
  },
  "message": "顧客を更新しました"
}
```

#### DELETE /customers/:id

顧客削除（論理削除）

**パスパラメータ**

| パラメータ | 型      | 説明   |
| ---------- | ------- | ------ |
| id         | integer | 顧客ID |

**レスポンス（204 No Content）**

レスポンスボディなし

---

### 5.6 ユーザーマスタAPI

#### GET /users

ユーザー一覧取得（管理者のみ）

**クエリパラメータ**

| パラメータ | 型      | 必須 | 説明                        |
| ---------- | ------- | ---- | --------------------------- |
| name       | string  | -    | 氏名（部分一致）            |
| email      | string  | -    | メールアドレス（部分一致）  |
| role       | string  | -    | 役割（sales/manager/admin） |
| department | string  | -    | 部署（部分一致）            |
| is_deleted | boolean | -    | 削除フラグ                  |
| page       | integer | -    | ページ番号                  |
| per_page   | integer | -    | 1ページあたりの件数         |

**レスポンス（200 OK）**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "田中太郎",
        "email": "tanaka@example.com",
        "role": "sales",
        "department": "営業1課",
        "manager_id": 2,
        "manager_name": "佐藤部長",
        "is_deleted": false
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_items": 10,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    }
  }
}
```

#### GET /users/:id

ユーザー詳細取得（管理者のみ）

**パスパラメータ**

| パラメータ | 型      | 説明       |
| ---------- | ------- | ---------- |
| id         | integer | ユーザーID |

**レスポンス（200 OK）**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "田中太郎",
    "email": "tanaka@example.com",
    "role": "sales",
    "department": "営業1課",
    "manager_id": 2,
    "manager_name": "佐藤部長",
    "is_deleted": false,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-15T14:30:00Z"
  }
}
```

#### POST /users

ユーザー作成（管理者のみ）

**リクエスト**

```json
{
  "name": "田中太郎",
  "email": "tanaka@example.com",
  "password": "password123",
  "role": "sales",
  "department": "営業1課",
  "manager_id": 2
}
```

**レスポンス（201 Created）**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "田中太郎",
    "email": "tanaka@example.com",
    "role": "sales",
    "department": "営業1課",
    "manager_id": 2,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  },
  "message": "ユーザーを作成しました"
}
```

#### PUT /users/:id

ユーザー更新（管理者のみ）

**パスパラメータ**

| パラメータ | 型      | 説明       |
| ---------- | ------- | ---------- |
| id         | integer | ユーザーID |

**リクエスト**

```json
{
  "name": "田中太郎",
  "email": "tanaka@example.com",
  "role": "manager",
  "department": "営業1課",
  "manager_id": null
}
```

**レスポンス（200 OK）**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "田中太郎",
    "email": "tanaka@example.com",
    "role": "manager",
    "department": "営業1課",
    "manager_id": null,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-15T14:30:00Z"
  },
  "message": "ユーザーを更新しました"
}
```

#### DELETE /users/:id

ユーザー削除（論理削除、管理者のみ）

**パスパラメータ**

| パラメータ | 型      | 説明       |
| ---------- | ------- | ---------- |
| id         | integer | ユーザーID |

**レスポンス（204 No Content）**

レスポンスボディなし

---

## 6. バリデーションルール

### 6.1 日報

| フィールド    | ルール                                                         |
| ------------- | -------------------------------------------------------------- |
| report_date   | 必須、日付形式、未来日不可、ユーザーIDとの組み合わせでユニーク |
| problem       | 文字列、500文字以内                                            |
| plan          | 文字列、500文字以内                                            |
| visit_records | 配列、1件以上                                                  |

### 6.2 訪問記録

| フィールド    | ルール                     |
| ------------- | -------------------------- |
| customer_id   | 必須、整数、存在する顧客ID |
| visit_content | 必須、文字列、1000文字以内 |
| visit_order   | 必須、整数、1以上          |

### 6.3 コメント

| フィールド | ルール                     |
| ---------- | -------------------------- |
| content    | 必須、文字列、1000文字以内 |

### 6.4 顧客

| フィールド      | ルール                         |
| --------------- | ------------------------------ |
| name            | 必須、文字列、100文字以内      |
| company_name    | 必須、文字列、200文字以内      |
| address         | 文字列、500文字以内            |
| phone           | 文字列、20文字以内             |
| email           | メール形式、255文字以内        |
| sales_person_id | 必須、整数、存在するユーザーID |
| notes           | 文字列                         |

### 6.5 ユーザー

| フィールド | ルール                                  |
| ---------- | --------------------------------------- |
| name       | 必須、文字列、100文字以内               |
| email      | 必須、メール形式、255文字以内、ユニーク |
| password   | 必須（作成時）、文字列、8文字以上       |
| role       | 必須、列挙型（sales/manager/admin）     |
| department | 文字列、100文字以内                     |
| manager_id | 整数、存在するユーザーID                |

---

## 7. セキュリティ

### 7.1 認証

- セッションベース認証
- セッションタイムアウト: 30分
- HTTPSのみ
- Cookie属性: HttpOnly, Secure, SameSite=Strict

### 7.2 認可

- ロールベースアクセス制御（RBAC）
- 営業：自分のリソースのみアクセス可能
- 上長：配下の営業のリソースにアクセス可能
- 管理者：全リソースにアクセス可能

### 7.3 入力検証

- すべてのユーザー入力をバリデーション
- SQLインジェクション対策
- XSS対策（エスケープ処理）
- CSRF対策（トークン検証）

### 7.4 レート制限

- ログインAPI: 5回/分
- その他API: 100回/分

---

## 8. 改版履歴

| 版数 | 改版日     | 改版者 | 改版内容 |
| ---- | ---------- | ------ | -------- |
| 1.0  | YYYY/MM/DD | -      | 初版作成 |
