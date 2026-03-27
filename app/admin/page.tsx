'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '../../components/language-provider'
import LanguageSwitcher from '../../components/language-switcher'

const API = {
  session: '/api/admin/session',
  orders: '/api/admin/orders',
  settings: '/api/admin/settings',
  paymentMethods: '/api/admin/payment-methods',
  logout: '/api/admin/logout',
}

type AdminTab = 'orders' | 'pricing'
type OrderStatus = 'pending_payment' | 'paid' | 'completed' | 'cancelled'
type NoticeType = 'success' | 'error'

type Notice = {
  type: NoticeType
  text: string
} | null

type OrderItem = {
  id?: number
  order_no: string
  username: string | null
  email: string | null
  product_type: string | null
  duration: string | null
  stars_amount: number | null
  amount: number | null
  price_usd: number | null
  payment_network: string | null
  tx_hash: string | null
  proof_image_base64: string | null
  status: OrderStatus | string | null
  public_note: string | null
  admin_note: string | null
  created_at: string | null
  updated_at?: string | null
}

type SiteConfig = {
  premium_3m_price: number
  premium_6m_price: number
  premium_12m_price: number
  stars_rate: number
  stars_min_amount: number
}

type PaymentMethod = {
  id?: number
  display_name: string
  chain_name: string
  token_name: string
  address: string
  sort_order: number
  is_enabled: boolean
  updated_at?: string | null
}

type FormState = {
  username: string
  email: string
  payment_network: string
  tx_hash: string
  public_note: string
  admin_note: string
}

type UiText = {
  title: string
  subtitle: string
  checking: string
  tabs: { orders: string; pricing: string }
  logout: string
  refreshing: string
  refreshNow: string
  autoRefresh: string
  searchPlaceholder: string
  all: string
  pending: string
  paid: string
  completed: string
  cancelled: string
  noOrders: string
  selectHint: string
  orderNo: string
  product: string
  amount: string
  createdAt: string
  username: string
  email: string
  network: string
  txHash: string
  currentStatus: string
  userNote: string
  adminNote: string
  saveHint: string
  saveChanges: string
  saving: string
  completedBtn: string
  restoreBtn: string
  cancelBtn: string
  deleteBtn: string
  restoring: string
  completing: string
  cancelling: string
  deleting: string
  viewLarge: string
  closeImage: string
  noImage: string
  noHash: string
  pricesTitle: string
  pricesHint: string
  price3m: string
  price6m: string
  price12m: string
  starsRate: string
  starsMinAmount: string
  saveConfig: string
  configSaving: string
  actionSuccess: string
  saveSuccess: string
  configSaveSuccess: string
  loadFailed: string
  actionFailed: string
  allTimeBoston: string
  editOrder: string
  methodsTitle: string
  methodsHint: string
  addMethod: string
  saveMethods: string
  methodsSaving: string
  displayName: string
  chainName: string
  tokenName: string
  address: string
  sortOrder: string
  enabled: string
  deleteMethod: string
  methodNamePlaceholder: string
  methodChainPlaceholder: string
  methodTokenPlaceholder: string
  methodsSaveSuccess: string
  methodDeleteSuccess: string
  methodDeleteConfirm: string
}

async function readJsonSafe(res: Response) {
  const contentType = res.headers.get('content-type') || ''
  const raw = await res.text()

  if (!contentType.includes('application/json')) {
    throw new Error(`接口没有返回 JSON（状态 ${res.status}）`)
  }

  try {
    return JSON.parse(raw)
  } catch {
    throw new Error(`接口 JSON 解析失败（状态 ${res.status}）`)
  }
}

const TEXTS: Record<string, UiText> = {
  de: {
    title: 'Admin-Konsole',
    subtitle: 'Bestellungen, Preise und Zahlungsmethoden zentral verwalten.',
    checking: 'Anmeldestatus wird geprüft...',
    tabs: { orders: 'Bestellungen', pricing: 'Preise & Zahlung' },
    logout: 'Abmelden',
    refreshing: 'Wird aktualisiert...',
    refreshNow: 'Jetzt aktualisieren',
    autoRefresh: 'Automatisch aktualisieren',
    searchPlaceholder: 'Nach E-Mail / Bestellnummer / Benutzername suchen',
    all: 'Alle',
    pending: 'Ausstehend',
    paid: 'Bezahlt',
    completed: 'Abgeschlossen',
    cancelled: 'Storniert',
    noOrders: 'Keine Bestellungen gefunden',
    selectHint: 'Bitte links eine Bestellung auswählen, um sie anzusehen und zu bearbeiten.',
    orderNo: 'Bestellnummer',
    product: 'Produkt',
    amount: 'Betrag',
    createdAt: 'Erstellt am',
    username: 'Telegram-Benutzername',
    email: 'E-Mail',
    network: 'Zahlungsnetzwerk',
    txHash: 'Transaktions-Hash',
    currentStatus: 'Aktueller Status',
    userNote: 'Öffentliche Notiz',
    adminNote: 'Interne Admin-Notiz',
    saveHint:
      'Speichern aktualisiert nur Notizen und Hash. Statusänderungen bitte über die Aktionsbuttons unten.',
    saveChanges: 'Änderungen speichern',
    saving: 'Wird gespeichert...',
    completedBtn: 'Als abgeschlossen markieren',
    restoreBtn: 'Als bezahlt markieren',
    cancelBtn: 'Als storniert markieren',
    deleteBtn: 'Bestellung löschen',
    restoring: 'Wird wiederhergestellt...',
    completing: 'Wird abgeschlossen...',
    cancelling: 'Wird storniert...',
    deleting: 'Wird gelöscht...',
    viewLarge: 'Groß anzeigen',
    closeImage: 'Schließen',
    noImage: 'Kein Zahlungsnachweisbild vorhanden.',
    noHash: 'Kein Hash angegeben',
    pricesTitle: 'Preiseinstellungen',
    pricesHint:
      'Hier können Premium-Preise, Stars-Stückpreis und die Mindestmenge für Stars angepasst werden.',
    price3m: 'TG Premium 3 Monate',
    price6m: 'TG Premium 6 Monate',
    price12m: 'TG Premium 12 Monate',
    starsRate: 'Stars Stückpreis (USD)',
    starsMinAmount: 'Mindestmenge Stars',
    saveConfig: 'Preise speichern',
    configSaving: 'Wird gespeichert...',
    actionSuccess: 'Aktion erfolgreich abgeschlossen',
    saveSuccess: 'Bestellung erfolgreich gespeichert',
    configSaveSuccess: 'Preise erfolgreich gespeichert',
    loadFailed: 'Daten konnten nicht geladen werden',
    actionFailed: 'Aktion fehlgeschlagen',
    allTimeBoston: 'Alle Zeitangaben basieren auf der Zeitzone von Boston',
    editOrder: 'Bestellung bearbeiten',
    methodsTitle: 'Zahlungsmethoden',
    methodsHint:
      'Diese Zahlungsmethoden werden öffentlich auf der Zahlungsseite angezeigt. Sie können Name, Netzwerk, Token, Adresse, Reihenfolge und Aktivstatus jederzeit ändern.',
    addMethod: 'Zahlungsmethode hinzufügen',
    saveMethods: 'Zahlungsmethoden speichern',
    methodsSaving: 'Wird gespeichert...',
    displayName: 'Anzeigename',
    chainName: 'Chain-Name',
    tokenName: 'Token-Name',
    address: 'Empfangsadresse',
    sortOrder: 'Reihenfolge',
    enabled: 'Aktiviert',
    deleteMethod: 'Löschen',
    methodNamePlaceholder: 'z. B. TRC20 / USDT',
    methodChainPlaceholder: 'z. B. TRC20',
    methodTokenPlaceholder: 'z. B. USDT',
    methodsSaveSuccess: 'Zahlungsmethoden erfolgreich gespeichert',
    methodDeleteSuccess: 'Zahlungsmethode gelöscht',
    methodDeleteConfirm: 'Diese Zahlungsmethode löschen?',
  },
  en: {
    title: 'Admin Console',
    subtitle: 'Manage orders, pricing, and payment methods in one place.',
    checking: 'Checking sign-in status...',
    tabs: { orders: 'Orders', pricing: 'Pricing & Payment' },
    logout: 'Sign out',
    refreshing: 'Refreshing...',
    refreshNow: 'Refresh',
    autoRefresh: 'Auto refresh',
    searchPlaceholder: 'Search by email / order no / username',
    all: 'All',
    pending: 'Pending',
    paid: 'Paid',
    completed: 'Completed',
    cancelled: 'Cancelled',
    noOrders: 'No orders found',
    selectHint: 'Select an order from the list to review and edit.',
    orderNo: 'Order No',
    product: 'Product',
    amount: 'Amount',
    createdAt: 'Created At',
    username: 'Telegram Username',
    email: 'Email',
    network: 'Payment Network',
    txHash: 'Transaction Hash',
    currentStatus: 'Current Status',
    userNote: 'Public Note',
    adminNote: 'Internal Admin Note',
    saveHint: 'Save updates notes and hash only. Use action buttons for status changes.',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    completedBtn: 'Mark completed',
    restoreBtn: 'Mark paid',
    cancelBtn: 'Mark cancelled',
    deleteBtn: 'Delete order',
    restoring: 'Restoring...',
    completing: 'Completing...',
    cancelling: 'Cancelling...',
    deleting: 'Deleting...',
    viewLarge: 'View large',
    closeImage: 'Close',
    noImage: 'No payment proof image available.',
    noHash: 'No hash provided',
    pricesTitle: 'Pricing settings',
    pricesHint: 'Update product pricing and the minimum purchase amount for Stars.',
    price3m: 'TG Premium 3 Months',
    price6m: 'TG Premium 6 Months',
    price12m: 'TG Premium 12 Months',
    starsRate: 'Stars unit price (USD)',
    starsMinAmount: 'Minimum Stars amount',
    saveConfig: 'Save Pricing',
    configSaving: 'Saving...',
    actionSuccess: 'Action completed successfully',
    saveSuccess: 'Order saved successfully',
    configSaveSuccess: 'Pricing saved successfully',
    loadFailed: 'Failed to load data',
    actionFailed: 'Action failed',
    allTimeBoston: 'All timestamps are based on Boston time',
    editOrder: 'Edit Order',
    methodsTitle: 'Payment methods',
    methodsHint:
      'These payment methods are shown publicly on the pay page. You can change labels, network name, token, address, order, and enabled status at any time.',
    addMethod: 'Add payment method',
    saveMethods: 'Save payment methods',
    methodsSaving: 'Saving...',
    displayName: 'Display name',
    chainName: 'Chain name',
    tokenName: 'Token name',
    address: 'Receiving address',
    sortOrder: 'Sort order',
    enabled: 'Enabled',
    deleteMethod: 'Delete',
    methodNamePlaceholder: 'e.g. TRC20 / USDT',
    methodChainPlaceholder: 'e.g. TRC20',
    methodTokenPlaceholder: 'e.g. USDT',
    methodsSaveSuccess: 'Payment methods saved successfully',
    methodDeleteSuccess: 'Payment method deleted',
    methodDeleteConfirm: 'Delete this payment method?',
  },
  es: {
    title: 'Consola de administración',
    subtitle: 'Gestiona pedidos, precios y métodos de pago en un solo lugar.',
    checking: 'Comprobando estado de inicio de sesión...',
    tabs: { orders: 'Pedidos', pricing: 'Precios y pago' },
    logout: 'Cerrar sesión',
    refreshing: 'Actualizando...',
    refreshNow: 'Actualizar',
    autoRefresh: 'Actualización automática',
    searchPlaceholder: 'Buscar por correo / número de pedido / usuario',
    all: 'Todos',
    pending: 'Pendiente',
    paid: 'Pagado',
    completed: 'Completado',
    cancelled: 'Cancelado',
    noOrders: 'No se encontraron pedidos',
    selectHint: 'Seleccione un pedido de la lista para revisarlo y editarlo.',
    orderNo: 'Número de pedido',
    product: 'Producto',
    amount: 'Importe',
    createdAt: 'Creado el',
    username: 'Nombre de usuario de Telegram',
    email: 'Correo electrónico',
    network: 'Red de pago',
    txHash: 'Hash de transacción',
    currentStatus: 'Estado actual',
    userNote: 'Nota pública',
    adminNote: 'Nota interna del administrador',
    saveHint:
      'Guardar solo actualiza notas y hash. Use los botones de acción para cambiar el estado.',
    saveChanges: 'Guardar cambios',
    saving: 'Guardando...',
    completedBtn: 'Marcar como completado',
    restoreBtn: 'Marcar como pagado',
    cancelBtn: 'Marcar como cancelado',
    deleteBtn: 'Eliminar pedido',
    restoring: 'Restaurando...',
    completing: 'Completando...',
    cancelling: 'Cancelando...',
    deleting: 'Eliminando...',
    viewLarge: 'Ver en grande',
    closeImage: 'Cerrar',
    noImage: 'No hay imagen de comprobante de pago.',
    noHash: 'No se proporcionó hash',
    pricesTitle: 'Configuración de precios',
    pricesHint:
      'Aquí puede ajustar los precios de Premium, el precio unitario de Stars y la cantidad mínima de compra.',
    price3m: 'TG Premium 3 meses',
    price6m: 'TG Premium 6 meses',
    price12m: 'TG Premium 12 meses',
    starsRate: 'Precio unitario de Stars (USD)',
    starsMinAmount: 'Cantidad mínima de Stars',
    saveConfig: 'Guardar precios',
    configSaving: 'Guardando...',
    actionSuccess: 'Acción completada correctamente',
    saveSuccess: 'Pedido guardado correctamente',
    configSaveSuccess: 'Precios guardados correctamente',
    loadFailed: 'Error al cargar los datos',
    actionFailed: 'La acción falló',
    allTimeBoston: 'Todas las horas se muestran en horario de Boston',
    editOrder: 'Editar pedido',
    methodsTitle: 'Métodos de pago',
    methodsHint:
      'Estos métodos de pago se mostrarán públicamente en la página de pago. Puede cambiar etiquetas, red, token, dirección, orden y estado de activación.',
    addMethod: 'Añadir método de pago',
    saveMethods: 'Guardar métodos de pago',
    methodsSaving: 'Guardando...',
    displayName: 'Nombre visible',
    chainName: 'Nombre de la red',
    tokenName: 'Nombre del token',
    address: 'Dirección de recepción',
    sortOrder: 'Orden',
    enabled: 'Activado',
    deleteMethod: 'Eliminar',
    methodNamePlaceholder: 'p. ej. TRC20 / USDT',
    methodChainPlaceholder: 'p. ej. TRC20',
    methodTokenPlaceholder: 'p. ej. USDT',
    methodsSaveSuccess: 'Métodos de pago guardados correctamente',
    methodDeleteSuccess: 'Método de pago eliminado',
    methodDeleteConfirm: '¿Eliminar este método de pago?',
  },
  fr: {
    title: 'Console d’administration',
    subtitle: 'Gérez les commandes, les prix et les méthodes de paiement au même endroit.',
    checking: 'Vérification de la connexion...',
    tabs: { orders: 'Commandes', pricing: 'Prix et paiement' },
    logout: 'Se déconnecter',
    refreshing: 'Actualisation...',
    refreshNow: 'Actualiser',
    autoRefresh: 'Actualisation automatique',
    searchPlaceholder: 'Rechercher par e-mail / numéro de commande / nom d’utilisateur',
    all: 'Tous',
    pending: 'En attente',
    paid: 'Payé',
    completed: 'Terminé',
    cancelled: 'Annulé',
    noOrders: 'Aucune commande trouvée',
    selectHint: 'Sélectionnez une commande dans la liste pour la consulter et la modifier.',
    orderNo: 'Numéro de commande',
    product: 'Produit',
    amount: 'Montant',
    createdAt: 'Créé le',
    username: 'Nom d’utilisateur Telegram',
    email: 'E-mail',
    network: 'Réseau de paiement',
    txHash: 'Hash de transaction',
    currentStatus: 'Statut actuel',
    userNote: 'Note publique',
    adminNote: 'Note interne admin',
    saveHint:
      'Enregistrer met uniquement à jour les notes et le hash. Utilisez les boutons d’action pour changer le statut.',
    saveChanges: 'Enregistrer les modifications',
    saving: 'Enregistrement...',
    completedBtn: 'Marquer comme terminé',
    restoreBtn: 'Marquer comme payé',
    cancelBtn: 'Marquer comme annulé',
    deleteBtn: 'Supprimer la commande',
    restoring: 'Restauration...',
    completing: 'Finalisation...',
    cancelling: 'Annulation...',
    deleting: 'Suppression...',
    viewLarge: 'Afficher en grand',
    closeImage: 'Fermer',
    noImage: 'Aucune image de preuve de paiement.',
    noHash: 'Aucun hash fourni',
    pricesTitle: 'Paramètres des prix',
    pricesHint:
      'Vous pouvez ajuster ici les prix Premium, le prix unitaire des Stars et la quantité minimale d’achat.',
    price3m: 'TG Premium 3 mois',
    price6m: 'TG Premium 6 mois',
    price12m: 'TG Premium 12 mois',
    starsRate: 'Prix unitaire des Stars (USD)',
    starsMinAmount: 'Quantité minimale de Stars',
    saveConfig: 'Enregistrer les prix',
    configSaving: 'Enregistrement...',
    actionSuccess: 'Action effectuée avec succès',
    saveSuccess: 'Commande enregistrée avec succès',
    configSaveSuccess: 'Prix enregistrés avec succès',
    loadFailed: 'Échec du chargement des données',
    actionFailed: 'Échec de l’action',
    allTimeBoston: 'Toutes les heures sont affichées selon le fuseau horaire de Boston',
    editOrder: 'Modifier la commande',
    methodsTitle: 'Méthodes de paiement',
    methodsHint:
      'Ces méthodes de paiement sont affichées publiquement sur la page de paiement. Vous pouvez modifier le libellé, le réseau, le token, l’adresse, l’ordre et l’état d’activation.',
    addMethod: 'Ajouter une méthode de paiement',
    saveMethods: 'Enregistrer les méthodes de paiement',
    methodsSaving: 'Enregistrement...',
    displayName: 'Nom affiché',
    chainName: 'Nom du réseau',
    tokenName: 'Nom du token',
    address: 'Adresse de réception',
    sortOrder: 'Ordre',
    enabled: 'Activé',
    deleteMethod: 'Supprimer',
    methodNamePlaceholder: 'ex. TRC20 / USDT',
    methodChainPlaceholder: 'ex. TRC20',
    methodTokenPlaceholder: 'ex. USDT',
    methodsSaveSuccess: 'Méthodes de paiement enregistrées avec succès',
    methodDeleteSuccess: 'Méthode de paiement supprimée',
    methodDeleteConfirm: 'Supprimer cette méthode de paiement ?',
  },
  ja: {
    title: '管理コンソール',
    subtitle: '注文、価格、支払い方法を1か所で管理します。',
    checking: 'ログイン状態を確認しています...',
    tabs: { orders: '注文管理', pricing: '価格と支払い' },
    logout: 'ログアウト',
    refreshing: '更新中...',
    refreshNow: '今すぐ更新',
    autoRefresh: '自動更新',
    searchPlaceholder: 'メール / 注文番号 / ユーザー名で検索',
    all: 'すべて',
    pending: '保留中',
    paid: '支払い済み',
    completed: '完了',
    cancelled: 'キャンセル済み',
    noOrders: '注文がありません',
    selectHint: '一覧から注文を選択して確認・編集してください。',
    orderNo: '注文番号',
    product: '商品',
    amount: '金額',
    createdAt: '作成日時',
    username: 'Telegramユーザー名',
    email: 'メールアドレス',
    network: '支払いネットワーク',
    txHash: 'トランザクションハッシュ',
    currentStatus: '現在の状態',
    userNote: '公開メモ',
    adminNote: '管理者内部メモ',
    saveHint:
      '保存ではメモとハッシュのみ更新されます。状態変更は下のアクションボタンを使用してください。',
    saveChanges: '変更を保存',
    saving: '保存中...',
    completedBtn: '完了にする',
    restoreBtn: '支払い済みに戻す',
    cancelBtn: 'キャンセルにする',
    deleteBtn: '注文を削除',
    restoring: '復元中...',
    completing: '完了処理中...',
    cancelling: 'キャンセル中...',
    deleting: '削除中...',
    viewLarge: '拡大表示',
    closeImage: '閉じる',
    noImage: '支払い証明画像はありません。',
    noHash: 'ハッシュ未入力',
    pricesTitle: '価格設定',
    pricesHint: 'Premium価格、Stars単価、Stars最小購入数量をここで調整できます。',
    price3m: 'TG Premium 3か月',
    price6m: 'TG Premium 6か月',
    price12m: 'TG Premium 12か月',
    starsRate: 'Stars 単価（USD）',
    starsMinAmount: 'Stars 最小購入数量',
    saveConfig: '価格を保存',
    configSaving: '保存中...',
    actionSuccess: '操作が完了しました',
    saveSuccess: '注文を保存しました',
    configSaveSuccess: '価格を保存しました',
    loadFailed: 'データの読み込みに失敗しました',
    actionFailed: '操作に失敗しました',
    allTimeBoston: 'すべての時刻はボストン時間で表示されます',
    editOrder: '注文を編集',
    methodsTitle: '支払い方法管理',
    methodsHint:
      'これらの支払い方法は支払いページに公開表示されます。表示名、ネットワーク、トークン、アドレス、順序、有効状態をいつでも変更できます。',
    addMethod: '支払い方法を追加',
    saveMethods: '支払い方法を保存',
    methodsSaving: '保存中...',
    displayName: '表示名',
    chainName: 'チェーン名',
    tokenName: 'トークン名',
    address: '受取アドレス',
    sortOrder: '並び順',
    enabled: '有効',
    deleteMethod: '削除',
    methodNamePlaceholder: '例：TRC20 / USDT',
    methodChainPlaceholder: '例：TRC20',
    methodTokenPlaceholder: '例：USDT',
    methodsSaveSuccess: '支払い方法を保存しました',
    methodDeleteSuccess: '支払い方法を削除しました',
    methodDeleteConfirm: 'この支払い方法を削除しますか？',
  },
  ko: {
    title: '관리 콘솔',
    subtitle: '주문, 가격, 결제 방식을 한 곳에서 관리합니다.',
    checking: '로그인 상태 확인 중...',
    tabs: { orders: '주문 관리', pricing: '가격 및 결제' },
    logout: '로그아웃',
    refreshing: '새로고침 중...',
    refreshNow: '지금 새로고침',
    autoRefresh: '자동 새로고침',
    searchPlaceholder: '이메일 / 주문번호 / 사용자명으로 검색',
    all: '전체',
    pending: '대기 중',
    paid: '결제 완료',
    completed: '완료',
    cancelled: '취소됨',
    noOrders: '주문이 없습니다',
    selectHint: '목록에서 주문을 선택해 확인 및 수정하세요.',
    orderNo: '주문번호',
    product: '상품',
    amount: '금액',
    createdAt: '생성 시간',
    username: 'Telegram 사용자명',
    email: '이메일',
    network: '결제 네트워크',
    txHash: '트랜잭션 해시',
    currentStatus: '현재 상태',
    userNote: '공개 메모',
    adminNote: '관리자 내부 메모',
    saveHint:
      '저장은 메모와 해시만 업데이트합니다. 상태 변경은 아래 액션 버튼을 사용하세요.',
    saveChanges: '변경 사항 저장',
    saving: '저장 중...',
    completedBtn: '완료로 표시',
    restoreBtn: '결제 완료로 복원',
    cancelBtn: '취소로 표시',
    deleteBtn: '주문 삭제',
    restoring: '복원 중...',
    completing: '완료 처리 중...',
    cancelling: '취소 중...',
    deleting: '삭제 중...',
    viewLarge: '크게 보기',
    closeImage: '닫기',
    noImage: '결제 증빙 이미지가 없습니다.',
    noHash: '해시가 없습니다',
    pricesTitle: '가격 설정',
    pricesHint: '여기서 Premium 가격, Stars 단가, Stars 최소 구매 수량을 조정할 수 있습니다.',
    price3m: 'TG Premium 3개월',
    price6m: 'TG Premium 6개월',
    price12m: 'TG Premium 12개월',
    starsRate: 'Stars 단가 (USD)',
    starsMinAmount: 'Stars 최소 구매 수량',
    saveConfig: '가격 저장',
    configSaving: '저장 중...',
    actionSuccess: '작업이 완료되었습니다',
    saveSuccess: '주문이 저장되었습니다',
    configSaveSuccess: '가격이 저장되었습니다',
    loadFailed: '데이터 불러오기에 실패했습니다',
    actionFailed: '작업에 실패했습니다',
    allTimeBoston: '모든 시간은 보스턴 시간대 기준입니다',
    editOrder: '주문 편집',
    methodsTitle: '결제 방식 관리',
    methodsHint:
      '이 결제 방식들은 결제 페이지에 공개 표시됩니다. 표시명, 네트워크, 토큰, 주소, 순서, 활성 상태를 언제든지 변경할 수 있습니다.',
    addMethod: '결제 방식 추가',
    saveMethods: '결제 방식 저장',
    methodsSaving: '저장 중...',
    displayName: '표시 이름',
    chainName: '체인 이름',
    tokenName: '토큰 이름',
    address: '수신 주소',
    sortOrder: '정렬 순서',
    enabled: '활성화',
    deleteMethod: '삭제',
    methodNamePlaceholder: '예: TRC20 / USDT',
    methodChainPlaceholder: '예: TRC20',
    methodTokenPlaceholder: '예: USDT',
    methodsSaveSuccess: '결제 방식이 저장되었습니다',
    methodDeleteSuccess: '결제 방식이 삭제되었습니다',
    methodDeleteConfirm: '이 결제 방식을 삭제하시겠습니까?',
  },
  'zh-cn': {
    title: '后台管理',
    subtitle: '在同一界面集中管理订单、价格和支付方式。',
    checking: '正在检查登录状态...',
    tabs: { orders: '订单管理', pricing: '价格与支付' },
    logout: '退出登录',
    refreshing: '刷新中...',
    refreshNow: '立即刷新',
    autoRefresh: '自动刷新',
    searchPlaceholder: '搜索邮箱 / 订单号 / 用户名',
    all: '全部',
    pending: '待处理',
    paid: '已支付',
    completed: '已完成',
    cancelled: '已取消',
    noOrders: '暂无订单',
    selectHint: '请先从列表中选择一个订单进行查看和编辑。',
    orderNo: '订单号',
    product: '商品',
    amount: '金额',
    createdAt: '创建时间',
    username: 'Telegram 用户名',
    email: '邮箱',
    network: '支付网络',
    txHash: '交易哈希',
    currentStatus: '当前状态',
    userNote: '用户可见备注',
    adminNote: '管理员内部备注',
    saveHint: '保存仅会更新备注和交易哈希。状态切换请使用下方动作按钮。',
    saveChanges: '保存修改',
    saving: '保存中...',
    completedBtn: '标记为已完成',
    restoreBtn: '恢复为已支付',
    cancelBtn: '标记为已取消',
    deleteBtn: '删除订单',
    restoring: '恢复中...',
    completing: '完成中...',
    cancelling: '取消中...',
    deleting: '删除中...',
    viewLarge: '查看大图',
    closeImage: '关闭',
    noImage: '暂无付款截图。',
    noHash: '暂无交易哈希',
    pricesTitle: '价格设置',
    pricesHint: '可在这里调整 Premium 价格、Stars 单价以及 Stars 最低购买数量。',
    price3m: 'TG Premium 3个月',
    price6m: 'TG Premium 6个月',
    price12m: 'TG Premium 12个月',
    starsRate: 'Stars 单价（USD）',
    starsMinAmount: 'Stars 最低购买数量',
    saveConfig: '保存价格',
    configSaving: '保存中...',
    actionSuccess: '操作成功',
    saveSuccess: '订单保存成功',
    configSaveSuccess: '价格保存成功',
    loadFailed: '加载数据失败',
    actionFailed: '操作失败',
    allTimeBoston: '所有时间均按波士顿时区显示',
    editOrder: '编辑订单',
    methodsTitle: '支付方式管理',
    methodsHint:
      '这些支付方式会公开显示在支付页。你可以随时调整顺序、显示名、链名、币种、地址以及启用状态。',
    addMethod: '新增支付方式',
    saveMethods: '保存支付方式',
    methodsSaving: '保存中...',
    displayName: '显示名称',
    chainName: '链名称',
    tokenName: '币种名称',
    address: '收款地址',
    sortOrder: '排序',
    enabled: '启用',
    deleteMethod: '删除',
    methodNamePlaceholder: '例如：TRC20 / USDT',
    methodChainPlaceholder: '例如：TRC20',
    methodTokenPlaceholder: '例如：USDT',
    methodsSaveSuccess: '支付方式保存成功',
    methodDeleteSuccess: '支付方式删除成功',
    methodDeleteConfirm: '确定删除这个支付方式吗？',
  },
  'zh-tw': {
    title: '後台管理',
    subtitle: '在同一介面集中管理訂單、價格和支付方式。',
    checking: '正在檢查登入狀態...',
    tabs: { orders: '訂單管理', pricing: '價格與支付' },
    logout: '登出',
    refreshing: '重新整理中...',
    refreshNow: '立即重新整理',
    autoRefresh: '自動重新整理',
    searchPlaceholder: '搜尋電子郵件 / 訂單號 / 用戶名',
    all: '全部',
    pending: '待處理',
    paid: '已支付',
    completed: '已完成',
    cancelled: '已取消',
    noOrders: '暫無訂單',
    selectHint: '請先從列表中選擇一筆訂單進行查看與編輯。',
    orderNo: '訂單號',
    product: '商品',
    amount: '金額',
    createdAt: '建立時間',
    username: 'Telegram 用戶名',
    email: '電子郵件',
    network: '支付網路',
    txHash: '交易雜湊',
    currentStatus: '目前狀態',
    userNote: '使用者可見備註',
    adminNote: '管理員內部備註',
    saveHint: '儲存僅會更新備註與交易雜湊。狀態切換請使用下方動作按鈕。',
    saveChanges: '儲存修改',
    saving: '儲存中...',
    completedBtn: '標記為已完成',
    restoreBtn: '恢復為已支付',
    cancelBtn: '標記為已取消',
    deleteBtn: '刪除訂單',
    restoring: '恢復中...',
    completing: '完成中...',
    cancelling: '取消中...',
    deleting: '刪除中...',
    viewLarge: '查看大圖',
    closeImage: '關閉',
    noImage: '暫無付款截圖。',
    noHash: '暫無交易雜湊',
    pricesTitle: '價格設定',
    pricesHint: '可在這裡調整 Premium 價格、Stars 單價以及 Stars 最低購買數量。',
    price3m: 'TG Premium 3個月',
    price6m: 'TG Premium 6個月',
    price12m: 'TG Premium 12個月',
    starsRate: 'Stars 單價（USD）',
    starsMinAmount: 'Stars 最低購買數量',
    saveConfig: '保存價格',
    configSaving: '保存中...',
    actionSuccess: '操作成功',
    saveSuccess: '訂單保存成功',
    configSaveSuccess: '價格保存成功',
    loadFailed: '載入資料失敗',
    actionFailed: '操作失敗',
    allTimeBoston: '所有時間均按波士頓時區顯示',
    editOrder: '編輯訂單',
    methodsTitle: '支付方式管理',
    methodsHint:
      '這些支付方式會公開顯示在支付頁。你可以隨時調整順序、顯示名稱、鏈名、幣種、地址以及啟用狀態。',
    addMethod: '新增支付方式',
    saveMethods: '保存支付方式',
    methodsSaving: '保存中...',
    displayName: '顯示名稱',
    chainName: '鏈名稱',
    tokenName: '幣種名稱',
    address: '收款地址',
    sortOrder: '排序',
    enabled: '啟用',
    deleteMethod: '刪除',
    methodNamePlaceholder: '例如：TRC20 / USDT',
    methodChainPlaceholder: '例如：TRC20',
    methodTokenPlaceholder: '例如：USDT',
    methodsSaveSuccess: '支付方式保存成功',
    methodDeleteSuccess: '支付方式刪除成功',
    methodDeleteConfirm: '確定刪除這個支付方式嗎？',
  },
}

function formatBostonTime(value: string | null) {
  if (!value) return '-'
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date(value))
  } catch {
    return value
  }
}

function getStatusClass(status: string | null | undefined) {
  const value = String(status || '').toLowerCase()
  if (value === 'completed') return 'completed'
  if (value === 'paid') return 'paid'
  if (value === 'cancelled') return 'cancelled'
  return 'pending'
}

function getStatusLabel(text: UiText, status: string | null | undefined) {
  const value = String(status || '').toLowerCase()
  if (value === 'completed') return text.completed
  if (value === 'paid') return text.paid
  if (value === 'cancelled') return text.cancelled
  return text.pending
}

function getProductLabel(order: OrderItem, lang: string) {
  const type = String(order.product_type || '').toLowerCase()

  if (type.includes('premium')) {
    const duration = String(order.duration || '')
    if (lang === 'zh-cn') {
      if (duration === '3m') return 'TG Premium 3个月'
      if (duration === '6m') return 'TG Premium 6个月'
      if (duration === '12m') return 'TG Premium 12个月'
    }
    if (lang === 'zh-tw') {
      if (duration === '3m') return 'TG Premium 3個月'
      if (duration === '6m') return 'TG Premium 6個月'
      if (duration === '12m') return 'TG Premium 12個月'
    }
    if (duration === '3m') return 'TG Premium 3 Months'
    if (duration === '6m') return 'TG Premium 6 Months'
    if (duration === '12m') return 'TG Premium 12 Months'
    return 'TG Premium'
  }

  if (type.includes('stars')) {
    return `Stars ${order.stars_amount ?? ''}`.trim()
  }

  return order.product_type || '-'
}

function buildSearchText(text: UiText, statusFilter: string) {
  if (statusFilter === 'pending_payment') return text.pending
  if (statusFilter === 'paid') return text.paid
  if (statusFilter === 'completed') return text.completed
  if (statusFilter === 'cancelled') return text.cancelled
  return text.all
}

function normalizePaymentMethod(item?: Partial<PaymentMethod>): PaymentMethod {
  return {
    id: item?.id,
    display_name: String(item?.display_name || ''),
    chain_name: String(item?.chain_name || ''),
    token_name: String(item?.token_name || ''),
    address: String(item?.address || ''),
    sort_order: Number(item?.sort_order ?? 0),
    is_enabled: item?.is_enabled !== false,
    updated_at: item?.updated_at ?? null,
  }
}

function AdminPageInner() {
  const { lang } = useI18n()
  const router = useRouter()
  const text = TEXTS[lang] || TEXTS.en

  const [tab, setTab] = useState<AdminTab>('orders')
  const [sessionChecked, setSessionChecked] = useState(false)

  const [orders, setOrders] = useState<OrderItem[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedOrderNo, setSelectedOrderNo] = useState('')

  const [form, setForm] = useState<FormState>({
    username: '',
    email: '',
    payment_network: '',
    tx_hash: '',
    public_note: '',
    admin_note: '',
  })

  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    premium_3m_price: 13.1,
    premium_6m_price: 17.1,
    premium_12m_price: 31.1,
    stars_rate: 0.02,
    stars_min_amount: 50,
  })

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [methodsLoading, setMethodsLoading] = useState(false)
  const [methodsSaving, setMethodsSaving] = useState(false)

  const [saveLoading, setSaveLoading] = useState(false)
  const [configLoading, setConfigLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<
    'complete' | 'restore' | 'cancel' | 'delete' | null
  >(null)

  const [pageError, setPageError] = useState('')
  const [orderNotice, setOrderNotice] = useState<Notice>(null)
  const [configNotice, setConfigNotice] = useState<Notice>(null)
  const [methodNotice, setMethodNotice] = useState<Notice>(null)

  const [previewImage, setPreviewImage] = useState('')

  const selectedOrder = useMemo(
    () => orders.find((item) => item.order_no === selectedOrderNo) || null,
    [orders, selectedOrderNo]
  )

  const syncFormFromOrder = useCallback((order: OrderItem | null) => {
    setForm({
      username: order?.username || '',
      email: order?.email || '',
      payment_network: order?.payment_network || '',
      tx_hash: order?.tx_hash || '',
      public_note: order?.public_note || '',
      admin_note: order?.admin_note || '',
    })
  }, [])

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return orders.filter((item) => {
      const matchStatus = statusFilter === 'all' ? true : String(item.status) === statusFilter
      if (!matchStatus) return false
      if (!keyword) return true

      const combined = [
        item.order_no,
        item.username || '',
        item.email || '',
        item.product_type || '',
        item.payment_network || '',
        item.tx_hash || '',
      ]
        .join(' ')
        .toLowerCase()

      return combined.includes(keyword)
    })
  }, [orders, search, statusFilter])

  const ensureSelection = useCallback(
    (list: OrderItem[]) => {
      if (!list.length) {
        setSelectedOrderNo('')
        syncFormFromOrder(null)
        return
      }

      const target = list.find((item) => item.order_no === selectedOrderNo) || list[0]
      setSelectedOrderNo(target.order_no)
      syncFormFromOrder(target)
    },
    [selectedOrderNo, syncFormFromOrder]
  )

  const loadOrders = useCallback(async () => {
    try {
      setPageError('')
      const params = new URLSearchParams()
      params.set('t', Date.now().toString())

      const res = await fetch(`${API.orders}?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      })
      const data = await readJsonSafe(res)
      if (!res.ok) throw new Error(data?.error || text.loadFailed)

      const list = Array.isArray(data?.orders) ? data.orders : []
      setOrders(list)
      ensureSelection(list)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : text.loadFailed)
    }
  }, [ensureSelection, text.loadFailed])

  const loadSiteConfig = useCallback(async () => {
    try {
      const res = await fetch(API.settings, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      })
      const data = await readJsonSafe(res)
      if (!res.ok) throw new Error(data?.error || text.loadFailed)

      if (data?.item) {
        setSiteConfig({
          premium_3m_price: Number(data.item.premium_3m_price ?? 13.1),
          premium_6m_price: Number(data.item.premium_6m_price ?? 17.1),
          premium_12m_price: Number(data.item.premium_12m_price ?? 31.1),
          stars_rate: Number(data.item.stars_rate ?? 0.02),
          stars_min_amount: Number(data.item.stars_min_amount ?? 50),
        })
      }
    } catch (err) {
      setPageError(err instanceof Error ? err.message : text.loadFailed)
    }
  }, [text.loadFailed])

  const loadPaymentMethods = useCallback(async () => {
    try {
      setMethodsLoading(true)
      const res = await fetch(API.paymentMethods, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      })
      const data = await readJsonSafe(res)
      if (!res.ok) throw new Error(data?.error || text.loadFailed)

      setPaymentMethods(Array.isArray(data?.items) ? data.items : [])
    } catch (err) {
      setPageError(err instanceof Error ? err.message : text.loadFailed)
    } finally {
      setMethodsLoading(false)
    }
  }, [text.loadFailed])

  useEffect(() => {
    let active = true

    async function bootstrap() {
      try {
        const res = await fetch(API.session, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        const data = await readJsonSafe(res)
        if (!active) return

        if (!res.ok || !data?.authenticated) {
          router.replace(`/admin/login?lang=${lang}`)
          return
        }

        setSessionChecked(true)
        await Promise.all([loadOrders(), loadSiteConfig(), loadPaymentMethods()])
      } catch {
        router.replace(`/admin/login?lang=${lang}`)
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [lang, router, loadOrders, loadSiteConfig, loadPaymentMethods])

  useEffect(() => {
    if (!sessionChecked || !autoRefresh || tab !== 'orders') return
    const timer = window.setInterval(() => {
      loadOrders()
    }, 10000)
    return () => window.clearInterval(timer)
  }, [sessionChecked, autoRefresh, tab, loadOrders])

  useEffect(() => {
    syncFormFromOrder(selectedOrder)
  }, [selectedOrder, syncFormFromOrder])

  const handleLogout = async () => {
    try {
      await fetch(API.logout, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      router.replace(`/admin/login?lang=${lang}`)
    }
  }

  const saveOrder = async () => {
    if (!selectedOrder) return

    try {
      setSaveLoading(true)
      setOrderNotice(null)

      const res = await fetch(API.orders, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_no: selectedOrder.order_no,
          tx_hash: form.tx_hash,
          public_note: form.public_note,
          admin_note: form.admin_note,
        }),
      })
      const data = await readJsonSafe(res)
      if (!res.ok) throw new Error(data?.error || text.actionFailed)

      setOrderNotice({ type: 'success', text: text.saveSuccess })
      await loadOrders()
    } catch (err) {
      setOrderNotice({
        type: 'error',
        text: err instanceof Error ? err.message : text.actionFailed,
      })
    } finally {
      setSaveLoading(false)
    }
  }

  const updateOrderStatus = async (status: 'completed' | 'paid' | 'cancelled') => {
    if (!selectedOrder) return

    try {
      if (status === 'completed') setActionLoading('complete')
      if (status === 'paid') setActionLoading('restore')
      if (status === 'cancelled') setActionLoading('cancel')
      setOrderNotice(null)

      const res = await fetch(API.orders, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_no: selectedOrder.order_no,
          status,
        }),
      })
      const data = await readJsonSafe(res)
      if (!res.ok) throw new Error(data?.error || text.actionFailed)

      setOrderNotice({ type: 'success', text: text.actionSuccess })
      await loadOrders()
    } catch (err) {
      setOrderNotice({
        type: 'error',
        text: err instanceof Error ? err.message : text.actionFailed,
      })
    } finally {
      setActionLoading(null)
    }
  }

  const deleteOrder = async () => {
    if (!selectedOrder) return

    try {
      setActionLoading('delete')
      setOrderNotice(null)

      const res = await fetch(API.orders, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_no: selectedOrder.order_no,
        }),
      })
      const data = await readJsonSafe(res)
      if (!res.ok) throw new Error(data?.error || text.actionFailed)

      setOrderNotice({ type: 'success', text: text.actionSuccess })
      await loadOrders()
    } catch (err) {
      setOrderNotice({
        type: 'error',
        text: err instanceof Error ? err.message : text.actionFailed,
      })
    } finally {
      setActionLoading(null)
    }
  }

  const saveSiteConfig = async () => {
    try {
      setConfigLoading(true)
      setConfigNotice(null)

      const res = await fetch(API.settings, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteConfig),
      })
      const data = await readJsonSafe(res)
      if (!res.ok) throw new Error(data?.error || text.actionFailed)

      setConfigNotice({ type: 'success', text: text.configSaveSuccess })
      await loadSiteConfig()
    } catch (err) {
      setConfigNotice({
        type: 'error',
        text: err instanceof Error ? err.message : text.actionFailed,
      })
    } finally {
      setConfigLoading(false)
    }
  }

  const updatePaymentMethod = (index: number, patch: Partial<PaymentMethod>) => {
    setPaymentMethods((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    )
  }

  const addPaymentMethod = () => {
    setPaymentMethods((prev) => [
      ...prev,
      normalizePaymentMethod({
        display_name: '',
        chain_name: '',
        token_name: '',
        address: '',
        sort_order: prev.length + 1,
        is_enabled: true,
      }),
    ])
  }

  const saveAllPaymentMethods = async () => {
    try {
      setMethodsSaving(true)
      setMethodNotice(null)

      const normalized = paymentMethods.map((item) => ({
        id: item.id,
        display_name: String(item.display_name || '').trim(),
        chain_name: String(item.chain_name || '').trim(),
        token_name: String(item.token_name || '').trim(),
        address: String(item.address || '').trim(),
        sort_order: Number(item.sort_order || 0),
        is_enabled: Boolean(item.is_enabled),
      }))

      const res = await fetch(API.paymentMethods, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: normalized }),
      })
      const data = await readJsonSafe(res)
      if (!res.ok) throw new Error(data?.error || text.actionFailed)

      setPaymentMethods(Array.isArray(data?.items) ? data.items : [])
      setMethodNotice({ type: 'success', text: text.methodsSaveSuccess })
    } catch (err) {
      setMethodNotice({
        type: 'error',
        text: err instanceof Error ? err.message : text.actionFailed,
      })
    } finally {
      setMethodsSaving(false)
    }
  }

  const deletePaymentMethod = async (item: PaymentMethod, index: number) => {
    const confirmed = window.confirm(text.methodDeleteConfirm)
    if (!confirmed) return

    try {
      setMethodsSaving(true)
      setMethodNotice(null)

      if (!item.id) {
        setPaymentMethods((prev) => prev.filter((_, i) => i !== index))
        setMethodNotice({ type: 'success', text: text.methodDeleteSuccess })
        return
      }

      const res = await fetch(API.paymentMethods, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      })
      const data = await readJsonSafe(res)
      if (!res.ok) throw new Error(data?.error || text.actionFailed)

      setPaymentMethods((prev) => prev.filter((row) => row.id !== item.id))
      setMethodNotice({ type: 'success', text: text.methodDeleteSuccess })
    } catch (err) {
      setMethodNotice({
        type: 'error',
        text: err instanceof Error ? err.message : text.actionFailed,
      })
    } finally {
      setMethodsSaving(false)
    }
  }

  if (!sessionChecked) {
    return <PageFallback />
  }

  return (
    <main className="admin-shell">
      <div className="admin-panel">
        <section className="hero-card">
          <div className="hero-copy">
            <h1 className="hero-title">{text.title}</h1>
            <p className="hero-subtitle">{text.subtitle}</p>
          </div>

          <div className="hero-actions-wrap">
            <div className="hero-actions-row">
              <LanguageSwitcher size="hero" fullWidth />
              <button type="button" className="logout-btn" onClick={handleLogout}>
                {text.logout}
              </button>
            </div>
          </div>
        </section>

        <section className="tabs-row two-tabs">
          <button
            type="button"
            className={`tab-btn ${tab === 'orders' ? 'active' : ''}`}
            onClick={() => setTab('orders')}
          >
            {text.tabs.orders}
          </button>
          <button
            type="button"
            className={`tab-btn ${tab === 'pricing' ? 'active' : ''}`}
            onClick={() => setTab('pricing')}
          >
            {text.tabs.pricing}
          </button>
        </section>

        {pageError ? <div className="status-box error">{pageError}</div> : null}

        {tab === 'orders' ? (
          <div className="orders-layout">
            <section className="card search-card">
              <div className="search-row">
                <input
                  className="input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={text.searchPlaceholder}
                />
                <button type="button" className="small-btn" onClick={loadOrders}>
                  {text.refreshNow}
                </button>
              </div>

              <div className="filter-row">
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                  <span>{text.autoRefresh}</span>
                </label>

                <div className="status-filter-grid">
                  {(['all', 'pending_payment', 'paid', 'completed', 'cancelled'] as const).map(
                    (value) => (
                      <button
                        key={value}
                        type="button"
                        className={`mini-tab ${statusFilter === value ? 'active' : ''}`}
                        onClick={() => setStatusFilter(value)}
                      >
                        {buildSearchText(text, value)}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="small-note">{text.allTimeBoston}</div>
            </section>

            <section className="card order-list-card">
              {filteredOrders.length === 0 ? (
                <div className="empty-text">{text.noOrders}</div>
              ) : (
                filteredOrders.map((order) => (
                  <button
                    key={order.order_no}
                    type="button"
                    className={`order-item ${selectedOrderNo === order.order_no ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedOrderNo(order.order_no)
                      syncFormFromOrder(order)
                    }}
                  >
                    <div className="order-item-top">
                      <div className="order-item-title">{order.order_no}</div>
                      <div className={`status ${getStatusClass(order.status)}`}>
                        {getStatusLabel(text, order.status)}
                      </div>
                    </div>

                    <div className="order-item-sub">{order.email || '-'}</div>
                    <div className="order-item-sub">{getProductLabel(order, lang)}</div>
                  </button>
                ))
              )}
            </section>

            <section className="card editor-card">
              {!selectedOrder ? (
                <div className="empty-text">{text.selectHint}</div>
              ) : (
                <>
                  <div className="section-head">
                    <h2 className="section-title">{text.editOrder}</h2>
                  </div>

                  <div className="meta-grid">
                    <div className="meta-item">
                      <span className="meta-label">{text.orderNo}</span>
                      <span>{selectedOrder.order_no}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">{text.product}</span>
                      <span>{getProductLabel(selectedOrder, lang)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">{text.amount}</span>
                      <span>${selectedOrder.price_usd ?? selectedOrder.amount ?? 0}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">{text.createdAt}</span>
                      <span>{formatBostonTime(selectedOrder.created_at)}</span>
                    </div>
                  </div>

                  <div className="form-grid">
                    <label className="setting-field">
                      <span>{text.username}</span>
                      <input
                        className="input"
                        value={form.username}
                        onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                      />
                    </label>

                    <label className="setting-field">
                      <span>{text.email}</span>
                      <input
                        className="input"
                        value={form.email}
                        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      />
                    </label>

                    <label className="setting-field">
                      <span>{text.network}</span>
                      <input
                        className="input"
                        value={form.payment_network}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, payment_network: e.target.value }))
                        }
                      />
                    </label>

                    <label className="setting-field">
                      <span>{text.txHash}</span>
                      <input
                        className="input mono"
                        value={form.tx_hash}
                        onChange={(e) => setForm((prev) => ({ ...prev, tx_hash: e.target.value }))}
                      />
                    </label>

                    <div className="readonly-status-row">
                      <span className="field-label">{text.currentStatus}</span>
                      <div className={`status ${getStatusClass(selectedOrder.status)}`}>
                        {getStatusLabel(text, selectedOrder.status)}
                      </div>
                    </div>

                    <label className="setting-field">
                      <span>{text.userNote}</span>
                      <textarea
                        className="textarea"
                        rows={4}
                        value={form.public_note}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, public_note: e.target.value }))
                        }
                      />
                    </label>

                    <label className="setting-field">
                      <span>{text.adminNote}</span>
                      <textarea
                        className="textarea"
                        rows={4}
                        value={form.admin_note}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, admin_note: e.target.value }))
                        }
                      />
                    </label>

                    <div className="save-hint">{text.saveHint}</div>

                    <button
                      type="button"
                      className="primary-btn"
                      onClick={saveOrder}
                      disabled={saveLoading}
                    >
                      {saveLoading ? text.saving : text.saveChanges}
                    </button>

                    {orderNotice ? (
                      <div className={`inline-notice ${orderNotice.type}`}>{orderNotice.text}</div>
                    ) : null}

                    <div className="preview-grid">
                      <div className="preview-box">
                        <span className="field-label">{text.txHash}</span>
                        <div className="hash-box mono">
                          {selectedOrder.tx_hash || form.tx_hash || text.noHash}
                        </div>
                      </div>

                      <div className="preview-box">
                        <span className="field-label">Proof Image</span>
                        {selectedOrder.proof_image_base64 ? (
                          <>
                            <img
                              src={selectedOrder.proof_image_base64}
                              alt="payment proof preview"
                              className="proof-image"
                            />
                            <button
                              type="button"
                              className="secondary-wide-btn"
                              onClick={() => setPreviewImage(selectedOrder.proof_image_base64 || '')}
                            >
                              {text.viewLarge}
                            </button>
                          </>
                        ) : (
                          <div className="preview-note-box">{text.noImage}</div>
                        )}
                      </div>
                    </div>

                    <div className="action-grid">
                      <button
                        type="button"
                        className={`admin-action-btn admin-action-complete ${
                          actionLoading === 'complete' ? 'loading' : ''
                        }`}
                        onClick={() => updateOrderStatus('completed')}
                        disabled={actionLoading !== null}
                      >
                        {actionLoading === 'complete' ? text.completing : text.completedBtn}
                      </button>

                      <button
                        type="button"
                        className={`admin-action-btn admin-action-restore ${
                          actionLoading === 'restore' ? 'loading' : ''
                        }`}
                        onClick={() => updateOrderStatus('paid')}
                        disabled={actionLoading !== null}
                      >
                        {actionLoading === 'restore' ? text.restoring : text.restoreBtn}
                      </button>

                      <button
                        type="button"
                        className={`admin-action-btn admin-action-cancel ${
                          actionLoading === 'cancel' ? 'loading' : ''
                        }`}
                        onClick={() => updateOrderStatus('cancelled')}
                        disabled={actionLoading !== null}
                      >
                        {actionLoading === 'cancel' ? text.cancelling : text.cancelBtn}
                      </button>

                      <button
                        type="button"
                        className={`admin-action-btn admin-action-delete ${
                          actionLoading === 'delete' ? 'loading' : ''
                        }`}
                        onClick={deleteOrder}
                        disabled={actionLoading !== null}
                      >
                        {actionLoading === 'delete' ? text.deleting : text.deleteBtn}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        ) : null}

        {tab === 'pricing' ? (
          <div className="pricing-layout">
            <section className="card single-card">
              <div className="section-head">
                <div>
                  <h2 className="section-title">{text.pricesTitle}</h2>
                  <p className="section-subtitle">{text.pricesHint}</p>
                </div>
              </div>

              <div className="settings-grid two-cols">
                <label className="setting-field">
                  <span>{text.price3m}</span>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={siteConfig.premium_3m_price}
                    onChange={(e) =>
                      setSiteConfig((prev) => ({
                        ...prev,
                        premium_3m_price: Number(e.target.value || 0),
                      }))
                    }
                  />
                </label>

                <label className="setting-field">
                  <span>{text.price6m}</span>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={siteConfig.premium_6m_price}
                    onChange={(e) =>
                      setSiteConfig((prev) => ({
                        ...prev,
                        premium_6m_price: Number(e.target.value || 0),
                      }))
                    }
                  />
                </label>

                <label className="setting-field">
                  <span>{text.price12m}</span>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={siteConfig.premium_12m_price}
                    onChange={(e) =>
                      setSiteConfig((prev) => ({
                        ...prev,
                        premium_12m_price: Number(e.target.value || 0),
                      }))
                    }
                  />
                </label>

                <label className="setting-field">
                  <span>{text.starsRate}</span>
                  <input
                    className="input"
                    type="number"
                    step="0.0001"
                    value={siteConfig.stars_rate}
                    onChange={(e) =>
                      setSiteConfig((prev) => ({
                        ...prev,
                        stars_rate: Number(e.target.value || 0),
                      }))
                    }
                  />
                </label>

                <label className="setting-field full-span">
                  <span>{text.starsMinAmount}</span>
                  <input
                    className="input"
                    type="number"
                    step="1"
                    min="1"
                    value={siteConfig.stars_min_amount}
                    onChange={(e) =>
                      setSiteConfig((prev) => ({
                        ...prev,
                        stars_min_amount: Number(e.target.value || 0),
                      }))
                    }
                  />
                </label>
              </div>

              <div className="save-bar">
                <button
                  type="button"
                  className="primary-btn save-bar-btn"
                  onClick={saveSiteConfig}
                  disabled={configLoading}
                >
                  {configLoading ? text.configSaving : text.saveConfig}
                </button>
              </div>

              {configNotice ? (
                <div className={`inline-notice ${configNotice.type}`}>{configNotice.text}</div>
              ) : null}
            </section>

            <section className="card single-card">
              <div className="section-head methods-head">
                <div>
                  <h2 className="section-title">{text.methodsTitle}</h2>
                  <p className="section-subtitle">{text.methodsHint}</p>
                </div>

                <div className="payment-method-actions">
                  <button type="button" className="small-btn" onClick={addPaymentMethod}>
                    {text.addMethod}
                  </button>
                  <button
                    type="button"
                    className="primary-btn slim"
                    onClick={saveAllPaymentMethods}
                    disabled={methodsSaving}
                  >
                    {methodsSaving ? text.methodsSaving : text.saveMethods}
                  </button>
                </div>
              </div>

              {methodNotice ? (
                <div className={`inline-notice ${methodNotice.type}`}>{methodNotice.text}</div>
              ) : null}

              <div className="payment-methods-grid">
                {methodsLoading ? (
                  <div className="empty-text">{text.refreshing}</div>
                ) : paymentMethods.length === 0 ? (
                  <div className="empty-text">{text.noOrders}</div>
                ) : (
                  paymentMethods.map((item, index) => (
                    <div key={item.id ?? `new-${index}`} className="method-card">
                      <div className="method-card-top">
                        <div className="method-card-index">#{index + 1}</div>

                        <div className="method-card-actions">
                          <label className="checkbox-row">
                            <input
                              type="checkbox"
                              checked={item.is_enabled}
                              onChange={(e) =>
                                updatePaymentMethod(index, { is_enabled: e.target.checked })
                              }
                            />
                            <span>{text.enabled}</span>
                          </label>

                          <button
                            type="button"
                            className="method-delete-btn"
                            onClick={() => deletePaymentMethod(item, index)}
                            disabled={methodsSaving}
                          >
                            {text.deleteMethod}
                          </button>
                        </div>
                      </div>

                      <div className="method-grid">
                        <label className="setting-field">
                          <span>{text.displayName}</span>
                          <input
                            className="input"
                            value={item.display_name}
                            onChange={(e) =>
                              updatePaymentMethod(index, { display_name: e.target.value })
                            }
                            placeholder={text.methodNamePlaceholder}
                          />
                        </label>

                        <label className="setting-field">
                          <span>{text.chainName}</span>
                          <input
                            className="input"
                            value={item.chain_name}
                            onChange={(e) =>
                              updatePaymentMethod(index, { chain_name: e.target.value })
                            }
                            placeholder={text.methodChainPlaceholder}
                          />
                        </label>

                        <label className="setting-field">
                          <span>{text.tokenName}</span>
                          <input
                            className="input"
                            value={item.token_name}
                            onChange={(e) =>
                              updatePaymentMethod(index, { token_name: e.target.value })
                            }
                            placeholder={text.methodTokenPlaceholder}
                          />
                        </label>

                        <label className="setting-field">
                          <span>{text.sortOrder}</span>
                          <input
                            className="input"
                            type="number"
                            value={item.sort_order}
                            onChange={(e) =>
                              updatePaymentMethod(index, {
                                sort_order: Number(e.target.value || 0),
                              })
                            }
                          />
                        </label>

                        <label className="setting-field method-address">
                          <span>{text.address}</span>
                          <textarea
                            className="textarea mono"
                            rows={4}
                            value={item.address}
                            onChange={(e) =>
                              updatePaymentMethod(index, { address: e.target.value })
                            }
                          />
                        </label>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        ) : null}
      </div>

      {previewImage ? (
        <div className="image-modal" onClick={() => setPreviewImage('')}>
          <div className="image-modal-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="image-close" onClick={() => setPreviewImage('')}>
              {text.closeImage}
            </button>
            <img
              src={previewImage}
              alt="payment proof large preview"
              className="image-modal-view"
            />
          </div>
        </div>
      ) : null}

      <style>{`${globalThemeStyles}\n${styles}`}</style>
    </main>
  )
}

function PageFallback() {
  return (
    <main className="admin-shell">
      <div className="admin-panel small-panel">
        <div className="loading-card">Loading...</div>
      </div>
      <style>{`${globalThemeStyles}\n${styles}`}</style>
    </main>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <AdminPageInner />
    </Suspense>
  )
}

const globalThemeStyles = `
  :root {
    --bg-main: linear-gradient(180deg, #f7f8fb 0%, #eef2f8 100%);
    --bg-card: rgba(255, 255, 255, 0.94);
    --bg-card-soft: rgba(255, 255, 255, 0.88);
    --bg-input: #ffffff;
    --text-main: #111827;
    --text-strong: #0f172a;
    --text-soft: #64748b;
    --border-soft: rgba(15, 23, 42, 0.08);
    --shadow-soft: 0 18px 50px rgba(15, 23, 42, 0.06);
    --brand: #071b57;
    --brand-contrast: #ffffff;
  }

  html[data-theme='dark'] {
    --bg-main: linear-gradient(180deg, #07111f 0%, #0b1324 100%);
    --bg-card: rgba(15, 23, 42, 0.9);
    --bg-card-soft: rgba(15, 23, 42, 0.84);
    --bg-input: rgba(15, 23, 42, 0.96);
    --text-main: #e5e7eb;
    --text-strong: #f8fafc;
    --text-soft: #94a3b8;
    --border-soft: rgba(255, 255, 255, 0.08);
    --shadow-soft: 0 18px 50px rgba(0, 0, 0, 0.28);
    --brand: #1d4ed8;
    --brand-contrast: #ffffff;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: var(--bg-main);
    color: var(--text-main);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  * {
    box-sizing: border-box;
  }
`

const styles = `
  .admin-shell {
    min-height: 100vh;
    background: var(--bg-main);
    padding: 18px 12px 34px;
  }

  .admin-panel {
    max-width: 1320px;
    margin: 0 auto;
    display: grid;
    gap: 16px;
  }

  .small-panel {
    max-width: 720px;
  }

  .loading-card,
  .card,
  .hero-card,
  .tabs-row,
  .status-box {
    border-radius: 26px;
    background: var(--bg-card);
    border: 1px solid var(--border-soft);
    box-shadow: var(--shadow-soft);
  }

  .loading-card {
    padding: 22px;
    font-size: 18px;
    font-weight: 700;
    text-align: center;
  }

  .hero-card {
    padding: 20px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(280px, 420px);
    gap: 16px;
    align-items: center;
  }

  .hero-copy {
    min-width: 0;
  }

  .hero-title {
    margin: 0;
    font-size: clamp(24px, 4vw, 34px);
    line-height: 1.1;
    color: var(--text-strong);
    font-weight: 900;
  }

  .hero-subtitle {
    margin: 8px 0 0;
    color: var(--text-soft);
    font-size: 14px;
    line-height: 1.7;
  }

  .hero-actions-wrap {
    width: 100%;
  }

  .hero-actions-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .small-btn,
  .secondary-wide-btn,
  .logout-btn {
    border: 1px solid var(--border-soft);
    background: var(--bg-card-soft);
    color: var(--text-main);
    border-radius: 999px;
    min-height: 52px;
    padding: 0 16px;
    font-size: 15px;
    font-weight: 800;
    transition: all .16s ease;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  }

  .small-btn:hover,
  .secondary-wide-btn:hover,
  .logout-btn:hover {
    background: rgba(255, 255, 255, 0.98);
  }

  .logout-btn {
    width: 100%;
  }

  .tabs-row {
    display: grid;
    gap: 10px;
    padding: 10px;
  }

  .two-tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tab-btn {
    border: none;
    border-radius: 18px;
    min-height: 54px;
    font-size: 16px;
    font-weight: 900;
    color: var(--text-main);
    background: var(--bg-card-soft);
    transition: all .16s ease;
  }

  .tab-btn.active {
    background: var(--brand);
    color: var(--brand-contrast);
    box-shadow: 0 14px 30px rgba(7, 27, 87, 0.22);
  }

  .status-box {
    padding: 14px 16px;
    font-size: 15px;
    font-weight: 700;
  }

  .status-box.error {
    border-color: rgba(220,38,38,0.16);
    color: #991b1b;
    background: #fef2f2;
  }

  .orders-layout {
    display: grid;
    grid-template-columns: 320px 360px minmax(0, 1fr);
    gap: 16px;
    align-items: start;
  }

  .pricing-layout {
    display: grid;
    gap: 16px;
  }

  .card {
    padding: 18px;
    min-width: 0;
    overflow: hidden;
  }

  .single-card {
    width: 100%;
  }

  .search-card {
    display: grid;
    gap: 14px;
    position: sticky;
    top: 18px;
  }

  .search-row {
    display: grid;
    grid-template-columns: minmax(0,1fr) 118px;
    gap: 10px;
  }

  .filter-row {
    display: grid;
    gap: 12px;
  }

  .checkbox-row {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--text-main);
    font-size: 14px;
    font-weight: 700;
  }

  .status-filter-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .mini-tab {
    border: none;
    min-height: 42px;
    border-radius: 14px;
    background: var(--bg-card-soft);
    color: var(--text-main);
    font-weight: 800;
    font-size: 13px;
    transition: all .16s ease;
  }

  .mini-tab.active {
    background: var(--brand);
    color: var(--brand-contrast);
  }

  .input,
  .textarea {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    border-radius: 18px;
    border: 1px solid var(--border-soft);
    background: var(--bg-input);
    color: var(--text-main);
    font-size: 16px;
    padding: 14px 16px;
    outline: none;
    transition: border-color .16s ease, box-shadow .16s ease;
  }

  .input:focus,
  .textarea:focus {
    border-color: rgba(245, 158, 11, 0.9);
    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.12);
  }

  .textarea {
    resize: vertical;
    line-height: 1.65;
  }

  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    word-break: break-all;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  .order-list-card {
    display: grid;
    gap: 12px;
    max-height: calc(100vh - 160px);
    overflow: auto;
  }

  .order-item {
    width: 100%;
    text-align: left;
    border-radius: 22px;
    border: 1px solid var(--border-soft);
    background: var(--bg-card-soft);
    padding: 14px;
    display: grid;
    gap: 8px;
    transition: all .16s ease;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
  }

  .order-item.active {
    border-color: rgba(7, 27, 87, 0.4);
    box-shadow: 0 16px 30px rgba(7, 27, 87, 0.12);
  }

  .order-item-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }

  .order-item-title {
    font-size: 17px;
    font-weight: 900;
    color: var(--text-strong);
    word-break: break-all;
  }

  .order-item-sub {
    color: var(--text-soft);
    font-size: 14px;
    word-break: break-word;
  }

  .status {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 900;
    border: 1px solid var(--border-soft);
    background: var(--bg-card-soft);
    color: var(--text-main);
    white-space: nowrap;
  }

  .status.pending {
    background: #fff7ed;
    color: #c2410c;
    border-color: rgba(194,65,12,0.16);
  }

  .status.paid {
    background: #eff6ff;
    color: #1d4ed8;
    border-color: rgba(29,78,216,0.16);
  }

  .status.completed {
    background: #ecfdf3;
    color: #166534;
    border-color: rgba(22,101,52,0.16);
  }

  .status.cancelled {
    background: #fef2f2;
    color: #b91c1c;
    border-color: rgba(185,28,28,0.16);
  }

  .editor-card {
    display: grid;
    gap: 16px;
  }

  .section-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    flex-wrap: wrap;
  }

  .section-title {
    margin: 0;
    font-size: 28px;
    font-weight: 900;
    color: var(--text-strong);
  }

  .section-subtitle {
    margin: 8px 0 0;
    color: var(--text-soft);
    font-size: 14px;
    line-height: 1.7;
    max-width: 860px;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .meta-item {
    border: 1px solid var(--border-soft);
    background: var(--bg-card-soft);
    border-radius: 18px;
    padding: 14px;
    display: grid;
    gap: 6px;
    line-height: 1.6;
  }

  .meta-label,
  .field-label {
    font-weight: 900;
    color: var(--text-strong);
    font-size: 13px;
  }

  .form-grid {
    display: grid;
    gap: 12px;
  }

  .readonly-status-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .save-hint {
    color: var(--text-soft);
    font-size: 14px;
    line-height: 1.7;
  }

  .primary-btn {
    width: 100%;
    min-height: 58px;
    border: none;
    border-radius: 20px;
    background: var(--brand);
    color: var(--brand-contrast);
    font-size: 18px;
    font-weight: 900;
    box-shadow: 0 16px 32px rgba(7, 27, 87, 0.2);
    transition: all .16s ease;
  }

  .primary-btn.slim {
    width: auto;
    min-height: 52px;
    border-radius: 999px;
    padding: 0 18px;
    font-size: 15px;
  }

  .save-bar {
    margin-top: 16px;
    display: flex;
    justify-content: flex-start;
  }

  .save-bar-btn {
    width: auto;
    min-width: 220px;
    padding: 0 22px;
  }

  .inline-notice {
    margin-top: 12px;
    border-radius: 16px;
    padding: 12px 14px;
    font-size: 14px;
    line-height: 1.6;
    font-weight: 700;
  }

  .inline-notice.success {
    background: rgba(22, 163, 74, 0.12);
    color: #166534;
    border: 1px solid rgba(22, 163, 74, 0.2);
  }

  .inline-notice.error {
    background: rgba(220, 38, 38, 0.1);
    color: #b91c1c;
    border: 1px solid rgba(220, 38, 38, 0.18);
  }

  .primary-btn:disabled,
  .admin-action-btn:disabled,
  .small-btn:disabled,
  .logout-btn:disabled,
  .method-delete-btn:disabled {
    cursor: not-allowed;
    opacity: .72;
  }

  .preview-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .preview-box {
    display: grid;
    gap: 10px;
  }

  .hash-box,
  .preview-note-box {
    min-height: 120px;
    border-radius: 18px;
    border: 1px solid var(--border-soft);
    background: var(--bg-card-soft);
    padding: 14px;
    display: block;
  }

  .proof-image {
    width: 100%;
    display: block;
    max-height: 320px;
    object-fit: cover;
    border-radius: 22px;
    border: 1px solid var(--border-soft);
    background: var(--bg-card-soft);
  }

  .action-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .admin-action-btn {
    width: 100%;
    min-height: 56px;
    border-radius: 18px;
    border: 1px solid var(--border-soft);
    font-size: 16px;
    font-weight: 900;
    transition:
      transform 0.16s ease,
      box-shadow 0.16s ease,
      background-color 0.16s ease,
      border-color 0.16s ease,
      color 0.16s ease,
      opacity 0.16s ease;
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
    background: var(--bg-card-soft);
  }

  .admin-action-complete {
    background: #ecfdf3;
    color: #166534;
    border-color: rgba(22, 101, 52, 0.16);
  }

  .admin-action-complete.loading,
  .admin-action-complete:hover {
    background: #16a34a;
    color: #ffffff;
    border-color: #16a34a;
    box-shadow: 0 12px 28px rgba(22, 163, 74, 0.22);
  }

  .admin-action-restore {
    background: #eff6ff;
    color: #1d4ed8;
    border-color: rgba(29, 78, 216, 0.16);
  }

  .admin-action-restore.loading,
  .admin-action-restore:hover {
    background: #2563eb;
    color: #ffffff;
    border-color: #2563eb;
    box-shadow: 0 12px 28px rgba(37, 99, 235, 0.22);
  }

  .admin-action-cancel {
    background: #fff7ed;
    color: #c2410c;
    border-color: rgba(194, 65, 12, 0.16);
  }

  .admin-action-cancel.loading,
  .admin-action-cancel:hover {
    background: #ea580c;
    color: #ffffff;
    border-color: #ea580c;
    box-shadow: 0 12px 28px rgba(234, 88, 12, 0.22);
  }

  .admin-action-delete {
    background: #fef2f2;
    color: #b91c1c;
    border-color: rgba(185, 28, 28, 0.16);
  }

  .admin-action-delete.loading,
  .admin-action-delete:hover {
    background: #dc2626;
    color: #ffffff;
    border-color: #dc2626;
    box-shadow: 0 12px 28px rgba(220, 38, 38, 0.22);
  }

  .payment-method-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .payment-methods-grid {
    display: grid;
    gap: 14px;
    margin-top: 16px;
  }

  .method-card {
    border: 1px solid var(--border-soft);
    background: var(--bg-card-soft);
    border-radius: 24px;
    padding: 16px;
    display: grid;
    gap: 14px;
  }

  .method-card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .method-card-index {
    min-height: 36px;
    padding: 0 12px;
    border-radius: 999px;
    background: rgba(7, 27, 87, 0.08);
    color: var(--brand);
    display: inline-flex;
    align-items: center;
    font-weight: 900;
    font-size: 13px;
  }

  .method-card-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  .method-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .method-address {
    grid-column: 1 / -1;
  }

  .method-delete-btn {
    min-height: 46px;
    padding: 0 16px;
    border-radius: 999px;
    border: 1px solid rgba(185, 28, 28, 0.12);
    background: var(--bg-card-soft);
    color: #b91c1c;
    font-weight: 900;
  }

  .settings-grid {
    display: grid;
    gap: 14px;
  }

  .settings-grid.two-cols {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .full-span {
    grid-column: 1 / -1;
  }

  .setting-field {
    display: grid;
    gap: 8px;
    color: var(--text-strong);
    font-weight: 800;
  }

  .empty-text {
    color: var(--text-soft);
    font-size: 15px;
    line-height: 1.7;
  }

  .small-note {
    color: var(--text-soft);
    font-size: 13px;
    line-height: 1.6;
  }

  .image-modal {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(2, 6, 23, 0.78);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;
  }

  .image-modal-card {
    position: relative;
    width: min(980px, 100%);
    max-height: 90vh;
    border-radius: 24px;
    padding: 16px;
    background: var(--bg-card);
    border: 1px solid var(--border-soft);
    box-shadow: var(--shadow-soft);
  }

  .image-close {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 1;
    min-height: 40px;
    padding: 0 14px;
    border: none;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.76);
    color: #fff;
    font-weight: 800;
  }

  .image-modal-view {
    width: 100%;
    max-height: calc(90vh - 32px);
    object-fit: contain;
    display: block;
    border-radius: 18px;
    background: rgba(15, 23, 42, 0.04);
  }

  @media (max-width: 1180px) {
    .orders-layout {
      grid-template-columns: 1fr;
    }

    .search-card {
      position: static;
    }

    .order-list-card {
      max-height: none;
    }
  }

  @media (max-width: 900px) {
    .hero-card {
      grid-template-columns: 1fr;
    }

    .preview-grid {
      grid-template-columns: 1fr;
    }

    .method-grid {
      grid-template-columns: 1fr 1fr;
    }

    .settings-grid.two-cols {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .admin-shell {
      padding: 14px 10px 28px;
    }

    .hero-card {
      padding: 16px;
    }

    .hero-actions-row {
      grid-template-columns: 1fr 1fr;
    }

    .two-tabs {
      grid-template-columns: 1fr 1fr;
    }

    .search-row {
      grid-template-columns: 1fr;
    }

    .status-filter-grid {
      grid-template-columns: 1fr 1fr;
    }

    .meta-grid,
    .action-grid,
    .method-grid {
      grid-template-columns: 1fr;
    }

    .section-title {
      font-size: 24px;
    }

    .primary-btn,
    .admin-action-btn,
    .logout-btn,
    .small-btn,
    .secondary-wide-btn {
      min-height: 52px;
      font-size: 15px;
    }

    .save-bar-btn {
      width: 100%;
      min-width: 0;
    }
  }
`
