# Kubernetes Manifest サンプル

このディレクトリには、Kubernetesの基本的なリソースのサンプルmanifestファイルが含まれています。

## ファイル一覧

### 1. nginx-deployment.yaml
- **内容**: NGINXのDeploymentとService
- **リソース**: Deployment, Service
- **特徴**: 
  - 3つのレプリカ
  - リソース制限設定
  - readiness/liveness probe設定
  - ClusterIP Service

### 2. simple-pod.yaml
- **内容**: 単体Pod
- **リソース**: Pod
- **特徴**:
  - Alpine Linuxコンテナ
  - 環境変数でPod情報を取得
  - 30秒間隔でメッセージ出力

### 3. configmap.yaml
- **内容**: 設定情報のConfigMap
- **リソース**: ConfigMap
- **特徴**:
  - アプリケーション設定
  - 設定ファイル（application.properties, nginx.conf）
  - データベース設定情報

### 4. secret.yaml
- **内容**: 機密情報のSecret
- **リソース**: Secret (3種類)
- **特徴**:
  - Opaque Secret（一般的な機密情報）
  - TLS Secret（SSL/TLS証明書）
  - Docker Registry Secret（コンテナレジストリ認証）

### 5. config-echo-pod.yaml
- **内容**: ConfigMapとSecretを参照してechoするPod
- **リソース**: Pod (2種類)
- **特徴**:
  - 環境変数としてConfigMap/Secretを読み込み
  - ファイルとしてConfigMapをマウント
  - 全てのConfigMap/Secretファイルをマウントする例

## 使用方法

### 1. 基本的なデプロイ手順

```bash
# ConfigMapとSecretを最初に作成
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml

# NGINXデプロイメント
kubectl apply -f nginx-deployment.yaml

# 単体Pod
kubectl apply -f simple-pod.yaml

# ConfigMap/Secret参照Pod
kubectl apply -f config-echo-pod.yaml
```

### 2. 動作確認

```bash
# Pod一覧確認
kubectl get pods

# ログ確認
kubectl logs simple-pod
kubectl logs config-echo-pod
kubectl logs config-echo-pod-mounted

# ConfigMapの内容確認
kubectl describe configmap app-config

# Secret一覧確認（値は表示されない）
kubectl describe secret app-secret

# Serviceの確認
kubectl get services
```

### 3. NGINXサービスへのアクセス

```bash
# Port forwardでローカルアクセス
kubectl port-forward service/nginx-service 8080:80

# ブラウザまたはcurlでアクセス
curl http://localhost:8080
```

### 4. クリーンアップ

```bash
# 全リソース削除
kubectl delete -f nginx-deployment.yaml
kubectl delete -f simple-pod.yaml
kubectl delete -f config-echo-pod.yaml
kubectl delete -f configmap.yaml
kubectl delete -f secret.yaml
```

## 注意事項

### Secret管理について
- `secret.yaml`内のSecretはサンプル用です
- 本番環境では以下の方法でSecretを作成することを推奨：

```bash
# コマンドラインでSecret作成
kubectl create secret generic app-secret \
  --from-literal=database.username=admin \
  --from-literal=database.password=secret123

# ファイルからSecret作成
kubectl create secret generic app-secret \
  --from-file=database.username=./username.txt \
  --from-file=database.password=./password.txt

# Docker Registry Secret作成
kubectl create secret docker-registry docker-registry-secret \
  --docker-server=registry.example.com \
  --docker-username=username \
  --docker-password=password
```

### Base64エンコード/デコード

```bash
# エンコード
echo -n "secret123" | base64

# デコード
echo "c2VjcmV0MTIz" | base64 -d
```

### ConfigMapの作成方法

```bash
# リテラル値から作成
kubectl create configmap app-config \
  --from-literal=app.name="Sample Application" \
  --from-literal=environment="production"

# ファイルから作成
kubectl create configmap app-config \
  --from-file=application.properties \
  --from-file=nginx.conf
```

## 学習ポイント

1. **リソース分離**: ConfigMapとSecretの使い分け
2. **環境変数vs ファイルマウント**: 設定の渡し方の選択
3. **セキュリティ**: Secretのファイルパーミッション設定
4. **運用**: kubectl コマンドでの作成と管理
5. **デバッグ**: ログ確認とトラブルシューティング

これらのサンプルを参考に、実際のアプリケーションに応じてmanifestをカスタマイズしてください。