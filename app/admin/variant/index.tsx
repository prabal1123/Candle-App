// import React, { useEffect, useState, useCallback } from 'react'
// import {
//   View,
//   Text,
//   ScrollView,
//   Pressable,
//   ActivityIndicator,
//   Image,
//   StyleSheet,
//   Platform,
// } from 'react-native'
// import { Picker } from '@react-native-picker/picker'
// import { createClient } from '@supabase/supabase-js'
// import { useAdminAuth } from '../../../hooks/useAdminAuth'

// const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
// const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''
// const supabase = createClient(supabaseUrl, supabaseKey)

// const JAR_TYPES = [
//   { value: '', label: '— unset —' },
//   { value: 'amber-jar', label: 'Amber jar' },
//   { value: 'wooden-lid', label: 'Wooden lid' },
//   { value: 'car-diffuser', label: 'Car diffuser' },
//   { value: 'wardrobe-sachet', label: 'Wardrobe sachet' },
//   { value: 'reed-diffuser', label: 'Reed diffuser' },
//   { value: 'wax-melt', label: 'Wax melt' },
//   { value: 'decor', label: 'Decor' },
//   { value: 'bouquet', label: 'Bouquet' },
//   { value: 'other', label: 'Other' },
// ]

// type ImageEntry = { url: string; alt?: string; role?: string }

// type Product = {
//   id: string
//   name: string
//   scent: string | null
//   jar_type: string | null
//   variant_group_id: string | null
//   price_cents: number
//   size: string | null
//   metadata: Record<string, unknown> | null
//   image_urls: ImageEntry[] | null
// }

// type Group = {
//   scent: string
//   name: string
//   products: Product[]
// }

// type Filter = 'all' | 'linked' | 'unlinked'

// function genUUID() {
//   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
//     const r = (Math.random() * 16) | 0
//     return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
//   })
// }

// function buildGroups(products: Product[]): Group[] {
//   const map: Record<string, Group> = {}
//   products.forEach((p) => {
//     const key = `${p.scent ?? 'No scent'}__${p.name.trim()}`
//     if (!map[key]) map[key] = { scent: p.scent ?? 'No scent', name: p.name.trim(), products: [] }
//     map[key].products.push(p)
//   })
//   return Object.values(map).sort((a, b) => a.scent.localeCompare(b.scent))
// }

// function getMainImage(product: Product): string | null {
//   if (!product.image_urls || product.image_urls.length === 0) return null
//   const main = product.image_urls.find((img) => img.role === 'main')
//   return (main ?? product.image_urls[0]).url
// }

// function Toast({ message }: { message: string | null }) {
//   if (!message) return null
//   return (
//     <View style={styles.toast} pointerEvents="none">
//       <Text style={styles.toastText}>{message}</Text>
//     </View>
//   )
// }

// function StatusBadge({ group, isSplit }: { group: Group; isSplit: boolean }) {
//   const allLinked = group.products.every((p) => p.variant_group_id)
//   const noneLinked = group.products.every((p) => !p.variant_group_id)
//   if (isSplit)    return <View style={[styles.badge, styles.badgeOrange]}><Text style={styles.badgeOrangeText}>Split</Text></View>
//   if (allLinked)  return <View style={[styles.badge, styles.badgeGreen]}><Text style={styles.badgeGreenText}>✓ Linked</Text></View>
//   if (noneLinked) return <View style={[styles.badge, styles.badgeAmber]}><Text style={styles.badgeAmberText}>Unlinked</Text></View>
//   return <View style={[styles.badge, styles.badgeBlue]}><Text style={styles.badgeBlueText}>Partial</Text></View>
// }

// function JarPill({ value }: { value: string | null }) {
//   const map: Record<string, { bg: string; text: string }> = {
//     'amber-jar':       { bg: '#FEF3C7', text: '#92400E' },
//     'wooden-lid':      { bg: '#DCFCE7', text: '#166534' },
//     'car-diffuser':    { bg: '#DBEAFE', text: '#1E40AF' },
//     'wardrobe-sachet': { bg: '#FCE7F3', text: '#9D174D' },
//     'reed-diffuser':   { bg: '#EDE9FE', text: '#5B21B6' },
//     'wax-melt':        { bg: '#FFEDD5', text: '#9A3412' },
//     'decor':           { bg: '#F0FDF4', text: '#065F46' },
//     'bouquet':         { bg: '#FDF2F8', text: '#86198F' },
//     'other':           { bg: '#F3F4F6', text: '#4B5563' },
//   }
//   const colors = value ? (map[value] ?? map.other) : { bg: '#F3F4F6', text: '#9CA3AF' }
//   return (
//     <View style={[styles.pill, { backgroundColor: colors.bg }]}>
//       <Text style={[styles.pillText, { color: colors.text }]}>{value ?? 'unset'}</Text>
//     </View>
//   )
// }

// function Checkbox({ checked, onPress }: { checked: boolean; onPress: () => void }) {
//   return (
//     <Pressable onPress={onPress} style={[styles.checkbox, checked && styles.checkboxChecked]}>
//       {checked && <Text style={styles.checkmark}>✓</Text>}
//     </Pressable>
//   )
// }

// function ProductImage({ product }: { product: Product }) {
//   const url = getMainImage(product)
//   if (!url) {
//     return (
//       <View style={styles.imgPlaceholder}>
//         <Text style={styles.imgPlaceholderText}>No{'\n'}image</Text>
//       </View>
//     )
//   }
//   return (
//     <Image
//       source={{ uri: url }}
//       style={styles.productImg}
//       resizeMode="cover"
//       accessibilityLabel={product.name}
//     />
//   )
// }

// export default function VariantAdminPage() {
  
//   const [groups, setGroups]         = useState<Group[]>([])
//   const [allProducts, setAllProducts] = useState<Product[]>([])
//   const [filter, setFilter]         = useState<Filter>('all')
//   const [loading, setLoading]       = useState(true)
//   const [savingIds, setSavingIds]   = useState<Set<string>>(new Set())
//   const [toast, setToast]           = useState<string | null>(null)
//   const [error, setError]           = useState<string | null>(null)
//   const [selected, setSelected]     = useState<Set<string>>(new Set())

//   const showToast = useCallback((msg: string) => {
//     setToast(msg)
//     setTimeout(() => setToast(null), 2500)
//   }, [])

//   useEffect(() => {
//     async function load() {
//       setLoading(true)
//       const { data, error } = await supabase
//         .from('products')
//         .select('id, name, scent, jar_type, variant_group_id, price_cents, size, metadata, image_urls')
//         .order('scent', { ascending: true })
//         .order('name', { ascending: true })
//       if (error) { setError(error.message); setLoading(false); return }
//       setAllProducts(data ?? [])
//       setGroups(buildGroups(data ?? []))
//       setLoading(false)
//     }
//     load()
//   }, [])

//   const filteredGroups = groups.filter((g) => {
//     if (filter === 'linked')   return g.products.every((p) => p.variant_group_id)
//     if (filter === 'unlinked') return g.products.every((p) => !p.variant_group_id)
//     return true
//   })

//   const totalLinked   = groups.filter((g) => g.products.every((p) => p.variant_group_id)).length
//   const totalUnlinked = groups.filter((g) => g.products.every((p) => !p.variant_group_id)).length
//   const totalPartial  = groups.length - totalLinked - totalUnlinked

//   function toggleSelect(id: string) {
//     setSelected((prev) => {
//       const n = new Set(prev)
//       n.has(id) ? n.delete(id) : n.add(id)
//       return n
//     })
//   }

//   function clearSelection() { setSelected(new Set()) }

//   // Merge selected products (across any groups) into one variant_group_id
//   async function mergeSelected() {
//     const ids = [...selected]
//     const existingGid = allProducts.find((p) => ids.includes(p.id) && p.variant_group_id)?.variant_group_id ?? genUUID()
//     setSavingIds((s) => new Set([...s, ...ids]))
//     const { error } = await supabase.from('products').update({ variant_group_id: existingGid }).in('id', ids)
//     setSavingIds((s) => { const n = new Set(s); ids.forEach((id) => n.delete(id)); return n })
//     if (error) { showToast('Error: ' + error.message); return }
//     const updated = allProducts.map((p) => ids.includes(p.id) ? { ...p, variant_group_id: existingGid } : p)
//     setAllProducts(updated)
//     setGroups(buildGroups(updated))
//     clearSelection()
//     showToast(`✓ Merged ${ids.length} products into one group`)
//   }

//   // Link all products within a single auto-grouped card
//   async function linkGroup(g: Group) {
//     const gid = g.products.find((p) => p.variant_group_id)?.variant_group_id ?? genUUID()
//     const ids = g.products.map((p) => p.id)
//     setSavingIds((s) => new Set([...s, ...ids]))
//     const { error } = await supabase.from('products').update({ variant_group_id: gid }).in('id', ids)
//     setSavingIds((s) => { const n = new Set(s); ids.forEach((id) => n.delete(id)); return n })
//     if (error) { showToast('Error: ' + error.message); return }
//     const updated = allProducts.map((p) => ids.includes(p.id) ? { ...p, variant_group_id: gid } : p)
//     setAllProducts(updated)
//     setGroups(buildGroups(updated))
//     showToast(`✓ Grouped ${ids.length} products`)
//   }

//   async function unlinkGroup(g: Group) {
//     const ids = g.products.map((p) => p.id)
//     setSavingIds((s) => new Set([...s, ...ids]))
//     const { error } = await supabase.from('products').update({ variant_group_id: null }).in('id', ids)
//     setSavingIds((s) => { const n = new Set(s); ids.forEach((id) => n.delete(id)); return n })
//     if (error) { showToast('Error: ' + error.message); return }
//     const updated = allProducts.map((p) => ids.includes(p.id) ? { ...p, variant_group_id: null } : p)
//     setAllProducts(updated)
//     setGroups(buildGroups(updated))
//     showToast(`Unlinked ${ids.length} products`)
//   }

//   async function updateJarType(productId: string, value: string) {
//     setSavingIds((s) => new Set([...s, productId]))
//     const { error } = await supabase.from('products').update({ jar_type: value || null }).eq('id', productId)
//     setSavingIds((s) => { const n = new Set(s); n.delete(productId); return n })
//     if (error) { showToast('Error: ' + error.message); return }
//     const updated = allProducts.map((p) => p.id === productId ? { ...p, jar_type: value || null } : p)
//     setAllProducts(updated)
//     setGroups(buildGroups(updated))
//     showToast('✓ Jar type saved')
//   }

//   const selectedProducts = allProducts.filter((p) => selected.has(p.id))

//   return (
//     <View style={styles.root}>
//       <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

//         {/* Header */}
//         <View style={styles.header}>
//           <Text style={styles.title}>Variant group manager</Text>
//           <Text style={styles.subtitle}>Group products by scent & name, assign jar types</Text>
//         </View>

//         {/* Stats */}
//         {!loading && !error && (
//           <View style={styles.statsRow}>
//             {[
//               { label: 'Total groups', value: groups.length,  color: '#111827' },
//               { label: 'Linked',       value: totalLinked,    color: '#166534' },
//               { label: 'Partial',      value: totalPartial,   color: '#1E40AF' },
//               { label: 'Unlinked',     value: totalUnlinked,  color: '#92400E' },
//             ].map((s) => (
//               <View key={s.label} style={styles.statCard}>
//                 <Text style={styles.statLabel}>{s.label}</Text>
//                 <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
//               </View>
//             ))}
//           </View>
//         )}

//         {/* Filters */}
//         {!loading && !error && (
//           <View style={styles.filterRow}>
//             {(['all', 'unlinked', 'linked'] as Filter[]).map((f) => (
//               <Pressable
//                 key={f}
//                 onPress={() => setFilter(f)}
//                 style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
//               >
//                 <Text style={[styles.filterBtnText, filter === f && styles.filterBtnTextActive]}>
//                   {f.charAt(0).toUpperCase() + f.slice(1)}
//                 </Text>
//               </Pressable>
//             ))}
//           </View>
//         )}

//         {/* Manual merge hint */}
//         {!loading && !error && (
//           <View style={styles.hintBox}>
//             <Text style={styles.hintText}>
//               💡 To merge products across different groups, check the boxes on each product row then tap "Merge selected" in the bar that appears at the bottom.
//             </Text>
//           </View>
//         )}

//         {loading && <ActivityIndicator style={{ marginTop: 48 }} color="#6B7280" />}
//         {error && <View style={styles.errorBox}><Text style={styles.errorText}>Error: {error}</Text></View>}
//         {!loading && !error && filteredGroups.length === 0 && (
//           <Text style={styles.emptyText}>No groups match this filter.</Text>
//         )}

//         {/* Groups */}
//         {filteredGroups.map((g) => {
//           const gid       = g.products.find((p) => p.variant_group_id)?.variant_group_id
//           const allLinked = g.products.every((p) => p.variant_group_id)
//           const uniqueGids = new Set(g.products.map((p) => p.variant_group_id).filter(Boolean))
//           const isSplit   = allLinked && uniqueGids.size > 1
//           const isSaving  = g.products.some((p) => savingIds.has(p.id))

//           return (
//             <View key={`${g.scent}__${g.name}`} style={styles.card}>

//               {/* Group header */}
//               <View style={styles.cardHeader}>
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.groupName}>{g.name}</Text>
//                   <Text style={styles.groupMeta}>
//                     {g.scent} · {g.products.length} variant{g.products.length > 1 ? 's' : ''}
//                     {gid ? `  ${gid.slice(0, 8)}…` : ''}
//                   </Text>
//                 </View>
//                 <View style={styles.cardActions}>
//                   <StatusBadge group={g} isSplit={isSplit} />
//                   {allLinked && !isSplit ? (
//                     <Pressable
//                       disabled={isSaving}
//                       onPress={() => unlinkGroup(g)}
//                       style={[styles.actionBtn, styles.actionBtnRed, isSaving && styles.disabled]}
//                     >
//                       <Text style={styles.actionBtnRedText}>{isSaving ? 'Saving…' : 'Unlink'}</Text>
//                     </Pressable>
//                   ) : !allLinked ? (
//                     <Pressable
//                       disabled={isSaving}
//                       onPress={() => linkGroup(g)}
//                       style={[styles.actionBtn, styles.actionBtnGreen, isSaving && styles.disabled]}
//                     >
//                       <Text style={styles.actionBtnGreenText}>{isSaving ? 'Saving…' : 'Group together'}</Text>
//                     </Pressable>
//                   ) : null}
//                 </View>
//               </View>

//               {/* Column headers */}
//               <View style={styles.tableHeader}>
//                 <View style={{ width: 32 }} />
//                 <View style={{ width: 52 }} />
//                 <Text style={[styles.colHead, { flex: 3 }]}>Product</Text>
//                 <Text style={[styles.colHead, { flex: 2 }]}>Size</Text>
//                 <Text style={[styles.colHead, { flex: 2 }]}>Type</Text>
//                 <Text style={[styles.colHead, { flex: 3 }]}>Set type</Text>
//                 <Text style={[styles.colHead, { flex: 2 }]}>Price</Text>
//               </View>

//               {/* Product rows */}
//               {g.products.map((p, i) => (
//                 <View key={p.id} style={[styles.row, i % 2 === 1 && styles.rowAlt, selected.has(p.id) && styles.rowSelected]}>

//                   {/* Checkbox */}
//                   <View style={{ width: 32, alignItems: 'center' }}>
//                     <Checkbox checked={selected.has(p.id)} onPress={() => toggleSelect(p.id)} />
//                   </View>

//                   {/* Thumbnail */}
//                   <View style={{ width: 52, paddingRight: 10 }}>
//                     <ProductImage product={p} />
//                   </View>

//                   {/* Name + color */}
//                   <View style={{ flex: 3 }}>
//                     <Text style={styles.productName} numberOfLines={2}>{p.name.trim()}</Text>
//                     {p.metadata?.color != null && (
//                       <Text style={styles.productColor}>{String(p.metadata.color)}</Text>
//                     )}
//                   </View>

//                   <Text style={[styles.cell, { flex: 2 }]}>{p.size ?? '—'}</Text>

//                   <View style={{ flex: 2, justifyContent: 'center' }}>
//                     <JarPill value={p.jar_type} />
//                   </View>

//                   <View style={{ flex: 3, justifyContent: 'center' }}>
//                     <View style={styles.pickerWrapper}>
//                       <Picker
//                         selectedValue={p.jar_type ?? ''}
//                         enabled={!savingIds.has(p.id)}
//                         onValueChange={(val) => updateJarType(p.id, val as string)}
//                         style={styles.picker}
//                         dropdownIconColor="#6B7280"
//                       >
//                         {JAR_TYPES.map((j) => (
//                           <Picker.Item key={j.value} label={j.label} value={j.value} />
//                         ))}
//                       </Picker>
//                     </View>
//                   </View>

//                   <Text style={[styles.cell, { flex: 2 }]}>
//                     ₹{(p.price_cents / 100).toFixed(0)}
//                   </Text>
//                 </View>
//               ))}

//             </View>
//           )
//         })}

//         <View style={{ height: selected.size >= 2 ? 100 : 40 }} />
//       </ScrollView>

//       {/* Merge bar — appears when 2+ selected */}
//       {selected.size >= 2 && (
//         <View style={styles.mergeBar}>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.mergeBarTitle}>{selected.size} products selected</Text>
//             <Text style={styles.mergeBarSub} numberOfLines={1}>
//               {selectedProducts.map((p) => p.name.trim()).join(', ')}
//             </Text>
//           </View>
//           <Pressable onPress={clearSelection} style={styles.mergeBarCancel}>
//             <Text style={styles.mergeBarCancelText}>Cancel</Text>
//           </Pressable>
//           <Pressable onPress={mergeSelected} style={styles.mergeBarBtn}>
//             <Text style={styles.mergeBarBtnText}>Merge selected</Text>
//           </Pressable>
//         </View>
//       )}

//       <Toast message={toast} />
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   root: { flex: 1, backgroundColor: '#F9FAFB' },
//   scroll: { flex: 1 },
//   container: { paddingHorizontal: 20, paddingTop: 24, maxWidth: 960, alignSelf: 'center', width: '100%' },

//   header: { marginBottom: 24 },
//   title: { fontSize: 22, fontWeight: '600', color: '#111827' },
//   subtitle: { fontSize: 13, color: '#6B7280', marginTop: 3 },

//   statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
//   statCard: { flex: 1, minWidth: 100, backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: '#E5E7EB', padding: 14 },
//   statLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
//   statValue: { fontSize: 22, fontWeight: '600' },

//   filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
//   filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, borderColor: '#D1D5DB', backgroundColor: '#fff' },
//   filterBtnActive: { backgroundColor: '#111827', borderColor: '#111827' },
//   filterBtnText: { fontSize: 13, color: '#6B7280' },
//   filterBtnTextActive: { color: '#fff', fontWeight: '500' },

//   hintBox: { backgroundColor: '#FFFBEB', borderRadius: 10, borderWidth: 0.5, borderColor: '#FDE68A', padding: 12, marginBottom: 16 },
//   hintText: { fontSize: 12, color: '#92400E', lineHeight: 18 },

//   card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: '#E5E7EB', marginBottom: 12, overflow: 'hidden' },
//   cardHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6', gap: 12, flexWrap: 'wrap' },
//   groupName: { fontSize: 14, fontWeight: '600', color: '#111827' },
//   groupMeta: { fontSize: 11, color: '#9CA3AF', marginTop: 2, fontFamily: Platform.OS === 'web' ? 'monospace' : undefined },
//   cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },

//   badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
//   badgeGreen: { backgroundColor: '#DCFCE7' },
//   badgeGreenText: { fontSize: 11, color: '#166534', fontWeight: '500' },
//   badgeAmber: { backgroundColor: '#FEF3C7' },
//   badgeAmberText: { fontSize: 11, color: '#92400E', fontWeight: '500' },
//   badgeBlue: { backgroundColor: '#DBEAFE' },
//   badgeBlueText: { fontSize: 11, color: '#1E40AF', fontWeight: '500' },
//   badgeOrange: { backgroundColor: '#FFF7ED' },
//   badgeOrangeText: { fontSize: 11, color: '#C2410C', fontWeight: '500' },

//   actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 0.5 },
//   actionBtnGreen: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
//   actionBtnGreenText: { fontSize: 12, color: '#166534', fontWeight: '500' },
//   actionBtnRed: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
//   actionBtnRedText: { fontSize: 12, color: '#991B1B', fontWeight: '500' },
//   disabled: { opacity: 0.4 },

//   tableHeader: { flexDirection: 'row', backgroundColor: '#F9FAFB', paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center' },
//   colHead: { fontSize: 11, fontWeight: '500', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 },

//   row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 0.5, borderTopColor: '#F3F4F6' },
//   rowAlt: { backgroundColor: '#FAFAFA' },
//   rowSelected: { backgroundColor: '#EFF6FF' },
//   cell: { fontSize: 13, color: '#4B5563' },
//   productName: { fontSize: 13, fontWeight: '500', color: '#111827' },
//   productColor: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },

//   checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#D1D5DB', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
//   checkboxChecked: { backgroundColor: '#111827', borderColor: '#111827' },
//   checkmark: { fontSize: 11, color: '#fff', fontWeight: '700', lineHeight: 14 },

//   productImg: { width: 42, height: 42, borderRadius: 6, backgroundColor: '#F3F4F6' },
//   imgPlaceholder: { width: 42, height: 42, borderRadius: 6, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
//   imgPlaceholderText: { fontSize: 9, color: '#9CA3AF', textAlign: 'center' },

//   pill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
//   pillText: { fontSize: 11, fontWeight: '500' },

//   pickerWrapper: { borderWidth: 0.5, borderColor: '#D1D5DB', borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff' },
//   picker: { fontSize: 12, color: '#374151', height: 36 },

//   mergeBar: {
//     position: 'absolute', bottom: 0, left: 0, right: 0,
//     backgroundColor: '#111827', paddingHorizontal: 20, paddingVertical: 14,
//     flexDirection: 'row', alignItems: 'center', gap: 12,
//     borderTopLeftRadius: 16, borderTopRightRadius: 16,
//     ...(Platform.OS === 'web' ? { boxShadow: '0 -4px 24px rgba(0,0,0,0.18)' } : { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.18, shadowRadius: 12 }),
//   },
//   mergeBarTitle: { fontSize: 14, fontWeight: '600', color: '#fff' },
//   mergeBarSub: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
//   mergeBarCancel: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 0.5, borderColor: '#374151' },
//   mergeBarCancelText: { fontSize: 13, color: '#9CA3AF' },
//   mergeBarBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#fff' },
//   mergeBarBtnText: { fontSize: 13, fontWeight: '600', color: '#111827' },

//   errorBox: { backgroundColor: '#FEF2F2', borderRadius: 10, borderWidth: 0.5, borderColor: '#FECACA', padding: 14, marginTop: 16 },
//   errorText: { color: '#991B1B', fontSize: 13 },
//   emptyText: { textAlign: 'center', color: '#9CA3AF', fontSize: 14, marginTop: 48 },

//   toast: { position: 'absolute', bottom: 80, alignSelf: 'center', backgroundColor: '#111827', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
//   toastText: { color: '#fff', fontSize: 13 },
// })
// app/admin/variant/index.tsx
import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  StyleSheet,
  Platform,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { createClient } from '@supabase/supabase-js'
import { useAdminAuth } from '../../../hooks/useAdminAuth'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

const JAR_TYPES = [
  { value: '', label: '— unset —' },
  { value: 'amber-jar', label: 'Amber jar' },
  { value: 'wooden-lid', label: 'Wooden lid' },
  { value: 'car-diffuser', label: 'Car diffuser' },
  { value: 'wardrobe-sachet', label: 'Wardrobe sachet' },
  { value: 'reed-diffuser', label: 'Reed diffuser' },
  { value: 'wax-melt', label: 'Wax melt' },
  { value: 'decor', label: 'Decor' },
  { value: 'bouquet', label: 'Bouquet' },
  { value: 'other', label: 'Other' },
]

type ImageEntry = { url: string; alt?: string; role?: string }

type Product = {
  id: string
  name: string
  scent: string | null
  jar_type: string | null
  variant_group_id: string | null
  price_cents: number
  size: string | null
  metadata: Record<string, unknown> | null
  image_urls: ImageEntry[] | null
}

type Group = {
  scent: string
  name: string
  products: Product[]
}

type Filter = 'all' | 'linked' | 'unlinked'

function genUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function buildGroups(products: Product[]): Group[] {
  const map: Record<string, Group> = {}
  products.forEach((p) => {
    const key = `${p.scent ?? 'No scent'}__${p.name.trim()}`
    if (!map[key]) map[key] = { scent: p.scent ?? 'No scent', name: p.name.trim(), products: [] }
    map[key].products.push(p)
  })
  return Object.values(map).sort((a, b) => a.scent.localeCompare(b.scent))
}

function getMainImage(product: Product): string | null {
  if (!product.image_urls || product.image_urls.length === 0) return null
  const main = product.image_urls.find((img) => img.role === 'main')
  return (main ?? product.image_urls[0]).url
}

function Toast({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <View style={styles.toast} pointerEvents="none">
      <Text style={styles.toastText}>{message}</Text>
    </View>
  )
}

function StatusBadge({ group, isSplit }: { group: Group; isSplit: boolean }) {
  const allLinked = group.products.every((p) => p.variant_group_id)
  const noneLinked = group.products.every((p) => !p.variant_group_id)
  if (isSplit)    return <View style={[styles.badge, styles.badgeOrange]}><Text style={styles.badgeOrangeText}>Split</Text></View>
  if (allLinked)  return <View style={[styles.badge, styles.badgeGreen]}><Text style={styles.badgeGreenText}>✓ Linked</Text></View>
  if (noneLinked) return <View style={[styles.badge, styles.badgeAmber]}><Text style={styles.badgeAmberText}>Unlinked</Text></View>
  return <View style={[styles.badge, styles.badgeBlue]}><Text style={styles.badgeBlueText}>Partial</Text></View>
}

function JarPill({ value }: { value: string | null }) {
  const map: Record<string, { bg: string; text: string }> = {
    'amber-jar':       { bg: '#FEF3C7', text: '#92400E' },
    'wooden-lid':      { bg: '#DCFCE7', text: '#166534' },
    'car-diffuser':    { bg: '#DBEAFE', text: '#1E40AF' },
    'wardrobe-sachet': { bg: '#FCE7F3', text: '#9D174D' },
    'reed-diffuser':   { bg: '#EDE9FE', text: '#5B21B6' },
    'wax-melt':        { bg: '#FFEDD5', text: '#9A3412' },
    'decor':           { bg: '#F0FDF4', text: '#065F46' },
    'bouquet':         { bg: '#FDF2F8', text: '#86198F' },
    'other':           { bg: '#F3F4F6', text: '#4B5563' },
  }
  const colors = value ? (map[value] ?? map.other) : { bg: '#F3F4F6', text: '#9CA3AF' }
  return (
    <View style={[styles.pill, { backgroundColor: colors.bg }]}>
      <Text style={[styles.pillText, { color: colors.text }]}>{value ?? 'unset'}</Text>
    </View>
  )
}

function Checkbox({ checked, onPress }: { checked: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked && <Text style={styles.checkmark}>✓</Text>}
    </Pressable>
  )
}

function ProductImage({ product }: { product: Product }) {
  const url = getMainImage(product)
  if (!url) {
    return (
      <View style={styles.imgPlaceholder}>
        <Text style={styles.imgPlaceholderText}>No{'\n'}image</Text>
      </View>
    )
  }
  return (
    <Image
      source={{ uri: url }}
      style={styles.productImg}
      resizeMode="cover"
      accessibilityLabel={product.name}
    />
  )
}

export default function VariantAdminPage() {
  // ── ALL HOOKS FIRST ───────────────────────────────────────────────────────
  const authState = useAdminAuth()

  const [groups, setGroups]           = useState<Group[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filter, setFilter]           = useState<Filter>('all')
  const [loading, setLoading]         = useState(true)
  const [savingIds, setSavingIds]     = useState<Set<string>>(new Set())
  const [toast, setToast]             = useState<string | null>(null)
  const [error, setError]             = useState<string | null>(null)
  const [selected, setSelected]       = useState<Set<string>>(new Set())

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('id, name, scent, jar_type, variant_group_id, price_cents, size, metadata, image_urls')
        .order('scent', { ascending: true })
        .order('name', { ascending: true })
      if (error) { setError(error.message); setLoading(false); return }
      setAllProducts(data ?? [])
      setGroups(buildGroups(data ?? []))
      setLoading(false)
    }
    load()
  }, [])

  // ── CONDITIONAL RETURNS AFTER ALL HOOKS ───────────────────────────────────

  if (authState === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <ActivityIndicator color="#6B7280" />
        <Text style={{ marginTop: 12, fontSize: 13, color: '#9CA3AF' }}>Checking access…</Text>
      </View>
    )
  }

  if (authState !== 'admin') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 32 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 8 }}>Access denied</Text>
        <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>
          {authState === 'unauthenticated' ? 'Please log in to continue.' : "You don't have admin permissions."}
        </Text>
      </View>
    )
  }

  // ── FUNCTIONS ─────────────────────────────────────────────────────────────

  const filteredGroups = groups.filter((g) => {
    if (filter === 'linked')   return g.products.every((p) => p.variant_group_id)
    if (filter === 'unlinked') return g.products.every((p) => !p.variant_group_id)
    return true
  })

  const totalLinked   = groups.filter((g) => g.products.every((p) => p.variant_group_id)).length
  const totalUnlinked = groups.filter((g) => g.products.every((p) => !p.variant_group_id)).length
  const totalPartial  = groups.length - totalLinked - totalUnlinked

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  function clearSelection() { setSelected(new Set()) }

  async function mergeSelected() {
    const ids = [...selected]
    const existingGid = allProducts.find((p) => ids.includes(p.id) && p.variant_group_id)?.variant_group_id ?? genUUID()
    setSavingIds((s) => new Set([...s, ...ids]))
    const { error } = await supabase.from('products').update({ variant_group_id: existingGid }).in('id', ids)
    setSavingIds((s) => { const n = new Set(s); ids.forEach((id) => n.delete(id)); return n })
    if (error) { showToast('Error: ' + error.message); return }
    const updated = allProducts.map((p) => ids.includes(p.id) ? { ...p, variant_group_id: existingGid } : p)
    setAllProducts(updated)
    setGroups(buildGroups(updated))
    clearSelection()
    showToast(`✓ Merged ${ids.length} products into one group`)
  }

  async function linkGroup(g: Group) {
    const gid = g.products.find((p) => p.variant_group_id)?.variant_group_id ?? genUUID()
    const ids = g.products.map((p) => p.id)
    setSavingIds((s) => new Set([...s, ...ids]))
    const { error } = await supabase.from('products').update({ variant_group_id: gid }).in('id', ids)
    setSavingIds((s) => { const n = new Set(s); ids.forEach((id) => n.delete(id)); return n })
    if (error) { showToast('Error: ' + error.message); return }
    const updated = allProducts.map((p) => ids.includes(p.id) ? { ...p, variant_group_id: gid } : p)
    setAllProducts(updated)
    setGroups(buildGroups(updated))
    showToast(`✓ Grouped ${ids.length} products`)
  }

  async function unlinkGroup(g: Group) {
    const ids = g.products.map((p) => p.id)
    setSavingIds((s) => new Set([...s, ...ids]))
    const { error } = await supabase.from('products').update({ variant_group_id: null }).in('id', ids)
    setSavingIds((s) => { const n = new Set(s); ids.forEach((id) => n.delete(id)); return n })
    if (error) { showToast('Error: ' + error.message); return }
    const updated = allProducts.map((p) => ids.includes(p.id) ? { ...p, variant_group_id: null } : p)
    setAllProducts(updated)
    setGroups(buildGroups(updated))
    showToast(`Unlinked ${ids.length} products`)
  }

  async function updateJarType(productId: string, value: string) {
    setSavingIds((s) => new Set([...s, productId]))
    const { error } = await supabase.from('products').update({ jar_type: value || null }).eq('id', productId)
    setSavingIds((s) => { const n = new Set(s); n.delete(productId); return n })
    if (error) { showToast('Error: ' + error.message); return }
    const updated = allProducts.map((p) => p.id === productId ? { ...p, jar_type: value || null } : p)
    setAllProducts(updated)
    setGroups(buildGroups(updated))
    showToast('✓ Jar type saved')
  }

  const selectedProducts = allProducts.filter((p) => selected.has(p.id))

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

        <View style={styles.header}>
          <Text style={styles.title}>Variant group manager</Text>
          <Text style={styles.subtitle}>Group products by scent & name, assign jar types</Text>
        </View>

        {!loading && !error && (
          <View style={styles.statsRow}>
            {[
              { label: 'Total groups', value: groups.length,  color: '#111827' },
              { label: 'Linked',       value: totalLinked,    color: '#166534' },
              { label: 'Partial',      value: totalPartial,   color: '#1E40AF' },
              { label: 'Unlinked',     value: totalUnlinked,  color: '#92400E' },
            ].map((s) => (
              <View key={s.label} style={styles.statCard}>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              </View>
            ))}
          </View>
        )}

        {!loading && !error && (
          <View style={styles.filterRow}>
            {(['all', 'unlinked', 'linked'] as Filter[]).map((f) => (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              >
                <Text style={[styles.filterBtnText, filter === f && styles.filterBtnTextActive]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {!loading && !error && (
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>
              💡 To merge products across different groups, check the boxes on each product row then tap "Merge selected" in the bar that appears at the bottom.
            </Text>
          </View>
        )}

        {loading && <ActivityIndicator style={{ marginTop: 48 }} color="#6B7280" />}
        {error && <View style={styles.errorBox}><Text style={styles.errorText}>Error: {error}</Text></View>}
        {!loading && !error && filteredGroups.length === 0 && (
          <Text style={styles.emptyText}>No groups match this filter.</Text>
        )}

        {filteredGroups.map((g) => {
          const gid       = g.products.find((p) => p.variant_group_id)?.variant_group_id
          const allLinked = g.products.every((p) => p.variant_group_id)
          const uniqueGids = new Set(g.products.map((p) => p.variant_group_id).filter(Boolean))
          const isSplit   = allLinked && uniqueGids.size > 1
          const isSaving  = g.products.some((p) => savingIds.has(p.id))

          return (
            <View key={`${g.scent}__${g.name}`} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.groupName}>{g.name}</Text>
                  <Text style={styles.groupMeta}>
                    {g.scent} · {g.products.length} variant{g.products.length > 1 ? 's' : ''}
                    {gid ? `  ${gid.slice(0, 8)}…` : ''}
                  </Text>
                </View>
                <View style={styles.cardActions}>
                  <StatusBadge group={g} isSplit={isSplit} />
                  {allLinked && !isSplit ? (
                    <Pressable
                      disabled={isSaving}
                      onPress={() => unlinkGroup(g)}
                      style={[styles.actionBtn, styles.actionBtnRed, isSaving && styles.disabled]}
                    >
                      <Text style={styles.actionBtnRedText}>{isSaving ? 'Saving…' : 'Unlink'}</Text>
                    </Pressable>
                  ) : !allLinked ? (
                    <Pressable
                      disabled={isSaving}
                      onPress={() => linkGroup(g)}
                      style={[styles.actionBtn, styles.actionBtnGreen, isSaving && styles.disabled]}
                    >
                      <Text style={styles.actionBtnGreenText}>{isSaving ? 'Saving…' : 'Group together'}</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>

              <View style={styles.tableHeader}>
                <View style={{ width: 32 }} />
                <View style={{ width: 52 }} />
                <Text style={[styles.colHead, { flex: 3 }]}>Product</Text>
                <Text style={[styles.colHead, { flex: 2 }]}>Size</Text>
                <Text style={[styles.colHead, { flex: 2 }]}>Type</Text>
                <Text style={[styles.colHead, { flex: 3 }]}>Set type</Text>
                <Text style={[styles.colHead, { flex: 2 }]}>Price</Text>
              </View>

              {g.products.map((p, i) => (
                <View key={p.id} style={[styles.row, i % 2 === 1 && styles.rowAlt, selected.has(p.id) && styles.rowSelected]}>
                  <View style={{ width: 32, alignItems: 'center' }}>
                    <Checkbox checked={selected.has(p.id)} onPress={() => toggleSelect(p.id)} />
                  </View>
                  <View style={{ width: 52, paddingRight: 10 }}>
                    <ProductImage product={p} />
                  </View>
                  <View style={{ flex: 3 }}>
                    <Text style={styles.productName} numberOfLines={2}>{p.name.trim()}</Text>
                    {p.metadata?.color != null && (
                      <Text style={styles.productColor}>{String(p.metadata.color)}</Text>
                    )}
                  </View>
                  <Text style={[styles.cell, { flex: 2 }]}>{p.size ?? '—'}</Text>
                  <View style={{ flex: 2, justifyContent: 'center' }}>
                    <JarPill value={p.jar_type} />
                  </View>
                  <View style={{ flex: 3, justifyContent: 'center' }}>
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={p.jar_type ?? ''}
                        enabled={!savingIds.has(p.id)}
                        onValueChange={(val) => updateJarType(p.id, val as string)}
                        style={styles.picker}
                        dropdownIconColor="#6B7280"
                      >
                        {JAR_TYPES.map((j) => (
                          <Picker.Item key={j.value} label={j.label} value={j.value} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                  <Text style={[styles.cell, { flex: 2 }]}>
                    ₹{(p.price_cents / 100).toFixed(0)}
                  </Text>
                </View>
              ))}
            </View>
          )
        })}

        <View style={{ height: selected.size >= 2 ? 100 : 40 }} />
      </ScrollView>

      {selected.size >= 2 && (
        <View style={styles.mergeBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.mergeBarTitle}>{selected.size} products selected</Text>
            <Text style={styles.mergeBarSub} numberOfLines={1}>
              {selectedProducts.map((p) => p.name.trim()).join(', ')}
            </Text>
          </View>
          <Pressable onPress={clearSelection} style={styles.mergeBarCancel}>
            <Text style={styles.mergeBarCancelText}>Cancel</Text>
          </Pressable>
          <Pressable onPress={mergeSelected} style={styles.mergeBarBtn}>
            <Text style={styles.mergeBarBtnText}>Merge selected</Text>
          </Pressable>
        </View>
      )}

      <Toast message={toast} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { flex: 1 },
  container: { paddingHorizontal: 20, paddingTop: 24, maxWidth: 960, alignSelf: 'center', width: '100%' },

  header: { marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '600', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 3 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  statCard: { flex: 1, minWidth: 100, backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: '#E5E7EB', padding: 14 },
  statLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '600' },

  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, borderColor: '#D1D5DB', backgroundColor: '#fff' },
  filterBtnActive: { backgroundColor: '#111827', borderColor: '#111827' },
  filterBtnText: { fontSize: 13, color: '#6B7280' },
  filterBtnTextActive: { color: '#fff', fontWeight: '500' },

  hintBox: { backgroundColor: '#FFFBEB', borderRadius: 10, borderWidth: 0.5, borderColor: '#FDE68A', padding: 12, marginBottom: 16 },
  hintText: { fontSize: 12, color: '#92400E', lineHeight: 18 },

  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: '#E5E7EB', marginBottom: 12, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6', gap: 12, flexWrap: 'wrap' },
  groupName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  groupMeta: { fontSize: 11, color: '#9CA3AF', marginTop: 2, fontFamily: Platform.OS === 'web' ? 'monospace' : undefined },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeGreen: { backgroundColor: '#DCFCE7' },
  badgeGreenText: { fontSize: 11, color: '#166534', fontWeight: '500' },
  badgeAmber: { backgroundColor: '#FEF3C7' },
  badgeAmberText: { fontSize: 11, color: '#92400E', fontWeight: '500' },
  badgeBlue: { backgroundColor: '#DBEAFE' },
  badgeBlueText: { fontSize: 11, color: '#1E40AF', fontWeight: '500' },
  badgeOrange: { backgroundColor: '#FFF7ED' },
  badgeOrangeText: { fontSize: 11, color: '#C2410C', fontWeight: '500' },

  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 0.5 },
  actionBtnGreen: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  actionBtnGreenText: { fontSize: 12, color: '#166534', fontWeight: '500' },
  actionBtnRed: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  actionBtnRedText: { fontSize: 12, color: '#991B1B', fontWeight: '500' },
  disabled: { opacity: 0.4 },

  tableHeader: { flexDirection: 'row', backgroundColor: '#F9FAFB', paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center' },
  colHead: { fontSize: 11, fontWeight: '500', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 },

  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 0.5, borderTopColor: '#F3F4F6' },
  rowAlt: { backgroundColor: '#FAFAFA' },
  rowSelected: { backgroundColor: '#EFF6FF' },
  cell: { fontSize: 13, color: '#4B5563' },
  productName: { fontSize: 13, fontWeight: '500', color: '#111827' },
  productColor: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },

  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#D1D5DB', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#111827', borderColor: '#111827' },
  checkmark: { fontSize: 11, color: '#fff', fontWeight: '700', lineHeight: 14 },

  productImg: { width: 42, height: 42, borderRadius: 6, backgroundColor: '#F3F4F6' },
  imgPlaceholder: { width: 42, height: 42, borderRadius: 6, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  imgPlaceholderText: { fontSize: 9, color: '#9CA3AF', textAlign: 'center' },

  pill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  pillText: { fontSize: 11, fontWeight: '500' },

  pickerWrapper: { borderWidth: 0.5, borderColor: '#D1D5DB', borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff' },
  picker: { fontSize: 12, color: '#374151', height: 36 },

  mergeBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#111827', paddingHorizontal: 20, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    ...(Platform.OS === 'web' ? { boxShadow: '0 -4px 24px rgba(0,0,0,0.18)' } : { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.18, shadowRadius: 12 }),
  },
  mergeBarTitle: { fontSize: 14, fontWeight: '600', color: '#fff' },
  mergeBarSub: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  mergeBarCancel: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 0.5, borderColor: '#374151' },
  mergeBarCancelText: { fontSize: 13, color: '#9CA3AF' },
  mergeBarBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#fff' },
  mergeBarBtnText: { fontSize: 13, fontWeight: '600', color: '#111827' },

  errorBox: { backgroundColor: '#FEF2F2', borderRadius: 10, borderWidth: 0.5, borderColor: '#FECACA', padding: 14, marginTop: 16 },
  errorText: { color: '#991B1B', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#9CA3AF', fontSize: 14, marginTop: 48 },

  toast: { position: 'absolute', bottom: 80, alignSelf: 'center', backgroundColor: '#111827', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  toastText: { color: '#fff', fontSize: 13 },
})