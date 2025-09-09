#!/bin/bash

# Kubernetes Manifest サンプルクリーンアップスクリプト

set -e

echo "=== Kubernetes Manifest サンプルクリーンアップ開始 ==="

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
read -p "このコンテキストからサンプルリソースを削除しますか？ (y/N): " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "クリーンアップをキャンセルしました"
    exit 0
fi

echo ""

# 削除前の状態確認
print_status "削除前のリソース状態:"
echo ""
echo "=== Pods ==="
kubectl get pods -l 'app in (nginx,simple-app,config-echo,config-echo-mounted)' || true

echo ""
echo "=== Deployments ==="
kubectl get deployments -l app=nginx || true

echo ""
echo "=== Services ==="
kubectl get services -l app=nginx || true

echo ""
echo "=== ConfigMaps ==="
kubectl get configmaps -l app=sample-app || true

echo ""
echo "=== Secrets ==="
kubectl get secrets -l app=sample-app || true

echo ""
read -p "上記のリソースを削除します。続行しますか？ (y/N): " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "クリーンアップをキャンセルしました"
    exit 0
fi

echo ""

# 1. Config Echo Podの削除
print_status "Config Echo Podを削除中..."
if kubectl delete -f config-echo-pod.yaml --ignore-not-found=true; then
    print_success "Config Echo Podの削除完了"
else
    print_warning "Config Echo Podの削除でエラーが発生（リソースが存在しない可能性があります）"
fi

# 2. Simple Podの削除
print_status "Simple Podを削除中..."
if kubectl delete -f simple-pod.yaml --ignore-not-found=true; then
    print_success "Simple Podの削除完了"
else
    print_warning "Simple Podの削除でエラーが発生（リソースが存在しない可能性があります）"
fi

# 3. NGINX DeploymentとServiceの削除
print_status "NGINX DeploymentとServiceを削除中..."
if kubectl delete -f nginx-deployment.yaml --ignore-not-found=true; then
    print_success "NGINX DeploymentとServiceの削除完了"
else
    print_warning "NGINX DeploymentとServiceの削除でエラーが発生（リソースが存在しない可能性があります）"
fi

# 4. ConfigMapの削除
print_status "ConfigMapを削除中..."
if kubectl delete -f configmap.yaml --ignore-not-found=true; then
    print_success "ConfigMapの削除完了"
else
    print_warning "ConfigMapの削除でエラーが発生（リソースが存在しない可能性があります）"
fi

# 5. Secretの削除
print_status "Secretを削除中..."
if kubectl delete -f secret.yaml --ignore-not-found=true; then
    print_success "Secretの削除完了"
else
    print_warning "Secretの削除でエラーが発生（リソースが存在しない可能性があります）"
fi

# Pod の終了確認（30秒間）
echo ""
print_status "Podの終了状態を30秒間監視します..."
kubectl get pods -l 'app in (nginx,simple-app,config-echo,config-echo-mounted)' -w --timeout=30s || true

echo ""
print_success "=== 全てのサンプルリソースのクリーンアップが完了しました ==="

# 削除後の状態確認
echo ""
print_status "削除後のリソース状態確認:"

echo ""
echo "=== 残存する関連Pods ==="
kubectl get pods -l 'app in (nginx,simple-app,config-echo,config-echo-mounted)' || echo "関連Podは見つかりませんでした"

echo ""
echo "=== 残存する関連Deployments ==="
kubectl get deployments -l app=nginx || echo "関連Deploymentは見つかりませんでした"

echo ""
echo "=== 残存する関連Services ==="
kubectl get services -l app=nginx || echo "関連Serviceは見つかりませんでした"

echo ""
echo "=== 残存する関連ConfigMaps ==="
kubectl get configmaps -l app=sample-app || echo "関連ConfigMapは見つかりませんでした"

echo ""
echo "=== 残存する関連Secrets ==="
kubectl get secrets -l app=sample-app || echo "関連Secretは見つかりませんでした"

echo ""
print_success "クリーンアップスクリプト実行完了！"

# 次のステップ案内
echo ""
echo "=== 次のステップ ==="
echo "1. 再デプロイする場合:"
echo "   ./deploy-all.sh"
echo ""
echo "2. 個別にリソースをデプロイする場合:"
echo "   kubectl apply -f configmap.yaml"
echo "   kubectl apply -f secret.yaml"
echo "   kubectl apply -f nginx-deployment.yaml"
echo "   # etc..."
echo ""
echo "3. 全体の状態確認:"
echo "   kubectl get all"
echo ""