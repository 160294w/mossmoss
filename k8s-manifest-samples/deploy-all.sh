#!/bin/bash

# Kubernetes Manifest サンプル一括デプロイスクリプト

set -e

echo "=== Kubernetes Manifest サンプルデプロイ開始 ==="

# 色付きアウトプット
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# kubectlコマンドの存在確認
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl コマンドが見つかりません"
    exit 1
fi

# Kubernetesクラスタへの接続確認
print_status "Kubernetesクラスタへの接続を確認中..."
if ! kubectl cluster-info &> /dev/null; then
    print_error "Kubernetesクラスタに接続できません"
    exit 1
fi
print_success "Kubernetesクラスタへの接続確認完了"

# 現在のコンテキスト表示
CURRENT_CONTEXT=$(kubectl config current-context)
print_status "現在のコンテキスト: $CURRENT_CONTEXT"

# 確認プロンプト
echo ""
read -p "このコンテキストにデプロイを続行しますか？ (y/N): " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "デプロイをキャンセルしました"
    exit 0
fi

echo ""

# 1. ConfigMapのデプロイ
print_status "ConfigMapをデプロイ中..."
if kubectl apply -f configmap.yaml; then
    print_success "ConfigMapのデプロイ完了"
else
    print_error "ConfigMapのデプロイに失敗"
    exit 1
fi

# 2. Secretのデプロイ
print_status "Secretをデプロイ中..."
if kubectl apply -f secret.yaml; then
    print_success "Secretのデプロイ完了"
else
    print_error "Secretのデプロイに失敗"
    exit 1
fi

# 3. NGINX DeploymentとServiceのデプロイ
print_status "NGINX DeploymentとServiceをデプロイ中..."
if kubectl apply -f nginx-deployment.yaml; then
    print_success "NGINX DeploymentとServiceのデプロイ完了"
else
    print_error "NGINX DeploymentとServiceのデプロイに失敗"
    exit 1
fi

# 4. Simple Podのデプロイ
print_status "Simple Podをデプロイ中..."
if kubectl apply -f simple-pod.yaml; then
    print_success "Simple Podのデプロイ完了"
else
    print_error "Simple Podのデプロイに失敗"
    exit 1
fi

# 5. Config Echo Podのデプロイ
print_status "Config Echo Podをデプロイ中..."
if kubectl apply -f config-echo-pod.yaml; then
    print_success "Config Echo Podのデプロイ完了"
else
    print_error "Config Echo Podのデプロイに失敗"
    exit 1
fi

echo ""
print_success "=== 全てのリソースのデプロイが完了しました ==="

# デプロイ結果の確認
echo ""
print_status "デプロイされたリソースの確認..."

echo ""
echo "=== ConfigMaps ==="
kubectl get configmaps -l app=sample-app

echo ""
echo "=== Secrets ==="
kubectl get secrets -l app=sample-app

echo ""
echo "=== Deployments ==="
kubectl get deployments

echo ""
echo "=== Services ==="
kubectl get services

echo ""
echo "=== Pods ==="
kubectl get pods

# Pod の状態確認（30秒間）
echo ""
print_status "Podの起動状態を30秒間監視します..."
kubectl get pods -w --timeout=30s || true

echo ""
echo "=== 次のステップ ==="
echo "1. Pod のログを確認:"
echo "   kubectl logs simple-pod"
echo "   kubectl logs config-echo-pod"
echo "   kubectl logs config-echo-pod-mounted"
echo ""
echo "2. NGINX サービスにアクセス:"
echo "   kubectl port-forward service/nginx-service 8080:80"
echo "   curl http://localhost:8080"
echo ""
echo "3. リソースの詳細確認:"
echo "   kubectl describe pod simple-pod"
echo "   kubectl describe configmap app-config"
echo "   kubectl describe secret app-secret"
echo ""
echo "4. クリーンアップ:"
echo "   ./cleanup.sh"
echo ""

print_success "デプロイスクリプト実行完了！"