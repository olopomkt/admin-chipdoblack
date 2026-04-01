export interface Pedido {
  id: string
  token: string
  nome: string
  telefone: string
  email: string
  plano: string
  max_chips: number
  dias: number
  frequencia: string
  chips_conectados: number
  status: 'aguardando_conexao' | 'aquecendo' | 'expirado' | 'pausado'
  id_pedido_checkout: string
  data_inicio: string
  data_fim: string
  criado_em: string
  upgrades: unknown[]
  ip_cadastro: string
}

export interface Instancia {
  id: string
  instancia: string
  whatsapp: string
  status: 'pendente' | 'conectada' | 'desconectada'
  pedido_token: string
  frequencia: string
  dias: number
  data_fim: string
  whitelist: string[]
  primeira_mensagem_enviada: string
  processando_em: string | null
  updated_at: string
  created_at: string
}

export interface ChipLog {
  id: string
  instancia: string
  evento: 'conectou' | 'desconectou' | 'expirou' | 'ban'
  detalhes: string
  criado_em: string
}

export interface LogRecente {
  instancia: string
  evento: string
  detalhes: string
  criado_em: string
  usuario_email: string
  usuario_nome: string
  plano: string
}

export interface AdminUser {
  email: string
  nome: string
  criado_em: string
}

export interface Metricas {
  total_pedidos: number
  pedidos_ativos: number
  pedidos_aguardando: number
  pedidos_expirados: number
  testes_gratis: number
  planos_pagos: number
  total_instancias: number
  instancias_online: number
  instancias_offline: number
  novos_hoje: number
  novos_semana: number
  usuarios_unicos: number
}

export interface Crescimento {
  dia: string
  novos_pedidos: number
  testes: number
  pagos: number
}

export interface Receita {
  plano: string
  quantidade: number
  preco_unitario: number
  receita_total: number
}

export const PLANOS_PRECOS: Record<string, number> = {
  '2chips_1dia': 0,
  '2chips_3dias': 47,
  '2chips_5dias': 77,
  '2chips_7dias': 107,
  '4chips_3dias': 87,
  '4chips_5dias': 117,
  '4chips_7dias': 147,
  '8chips_3dias': 127,
  '8chips_5dias': 157,
  '8chips_7dias': 187,
}

export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export const formatDate = (date: string): string => {
  if (!date) return '—'
  return new Date(date).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatDateShort = (date: string): string => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
  })
}
