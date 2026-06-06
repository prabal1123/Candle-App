// // app/admin/products/index.tsx
// import React, { useEffect, useState, useCallback, useRef } from 'react'
// import {
//   View,
//   Text,
//   ScrollView,
//   Pressable,
//   ActivityIndicator,
//   Image,
//   StyleSheet,
//   Platform,
//   TextInput,
//   Modal,
//   KeyboardAvoidingView,
//   Alert,
// } from 'react-native'
// import { createClient } from '@supabase/supabase-js'
// import { useAdminAuth } from '../../../hooks/useAdminAuth'

// const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
// const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''
// const supabase = createClient(supabaseUrl, supabaseKey)

// // ── Constants ──────────────────────────────────────────────────────────────────

// const JAR_TYPES = [
//   { value: '', label: '— unset —' },
//   { value: 'amber-jar', label: 'Amber Jar' },
//   { value: 'wooden-lid', label: 'Wooden Lid' },
//   { value: 'car-diffuser', label: 'Car Diffuser' },
//   { value: 'wardrobe-sachet', label: 'Wardrobe Sachet' },
//   { value: 'reed-diffuser', label: 'Reed Diffuser' },
//   { value: 'wax-melt', label: 'Wax Melt' },
//   { value: 'decor', label: 'Decor' },
//   { value: 'bouquet', label: 'Bouquet' },
//   { value: 'other', label: 'Other' },
// ]

// const PRODUCT_TYPES = [
//   { value: '', label: '— unset —' },
//   { value: 'jar', label: 'Jar & Container' },
//   { value: 'gift-set', label: 'Gift Set' },
//   { value: 'decorative', label: 'Decorative' },
// ]

// // ── Types ──────────────────────────────────────────────────────────────────────

// type ImageEntry = { url: string; alt?: string; role?: string }

// type Product = {
//   id: string
//   name: string
//   scent: string | null
//   jar_type: string | null
//   product_type: string | null
//   variant_group_id: string | null
//   price_cents: number
//   size: string | null
//   description: string | null
//   inventory_count: number | null
//   metadata: Record<string, unknown> | null
//   image_urls: ImageEntry[] | null
//   created_at: string | null
// }

// type ProductDraft = Omit<Product, 'id' | 'created_at'>

// const EMPTY_DRAFT: ProductDraft = {
//   name: '',
//   scent: null,
//   jar_type: null,
//   product_type: null,
//   variant_group_id: null,
//   price_cents: 0,
//   size: null,
//   description: null,
//   inventory_count: null,
//   metadata: null,
//   image_urls: null,
// }

// type Filter = 'all' | 'jar' | 'gift-set' | 'decorative'
// type SortKey = 'created_at' | 'name' | 'price_cents' | 'inventory_count'

// // ── Helpers ────────────────────────────────────────────────────────────────────

// function genUUID() {
//   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
//     const r = (Math.random() * 16) | 0
//     return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
//   })
// }

// function getMainImage(product: Product): string | null {
//   if (!product.image_urls || product.image_urls.length === 0) return null
//   const main = product.image_urls.find((img) => img.role === 'main')
//   return (main ?? product.image_urls[0]).url
// }

// function formatPrice(cents: number) {
//   return `₹${(cents / 100).toFixed(0)}`
// }

// function timeAgo(iso: string | null) {
//   if (!iso) return '—'
//   const diff = Date.now() - new Date(iso).getTime()
//   const days = Math.floor(diff / 86400000)
//   if (days === 0) return 'Today'
//   if (days === 1) return 'Yesterday'
//   if (days < 30) return `${days}d ago`
//   if (days < 365) return `${Math.floor(days / 30)}mo ago`
//   return `${Math.floor(days / 365)}y ago`
// }

// // ── Sub-components ─────────────────────────────────────────────────────────────

// function Toast({ message }: { message: string | null }) {
//   if (!message) return null
//   return (
//     <View style={styles.toast} pointerEvents="none">
//       <Text style={styles.toastText}>{message}</Text>
//     </View>
//   )
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

// function StockBadge({ count }: { count: number | null }) {
//   if (count === null) return <View style={[styles.badge, styles.badgeGray]}><Text style={styles.badgeGrayText}>—</Text></View>
//   if (count === 0)    return <View style={[styles.badge, styles.badgeRed]}><Text style={styles.badgeRedText}>Out of stock</Text></View>
//   if (count <= 5)     return <View style={[styles.badge, styles.badgeAmber]}><Text style={styles.badgeAmberText}>Low: {count}</Text></View>
//   return <View style={[styles.badge, styles.badgeGreen]}><Text style={styles.badgeGreenText}>{count} in stock</Text></View>
// }

// // ── Form field components ──────────────────────────────────────────────────────

// function Field({
//   label,
//   value,
//   onChange,
//   placeholder,
//   multiline,
//   keyboardType,
//   hint,
// }: {
//   label: string
//   value: string
//   onChange: (v: string) => void
//   placeholder?: string
//   multiline?: boolean
//   keyboardType?: 'default' | 'numeric' | 'decimal-pad'
//   hint?: string
// }) {
//   return (
//     <View style={styles.fieldWrapper}>
//       <Text style={styles.fieldLabel}>{label}</Text>
//       {hint && <Text style={styles.fieldHint}>{hint}</Text>}
//       <TextInput
//         style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
//         value={value}
//         onChangeText={onChange}
//         placeholder={placeholder ?? ''}
//         placeholderTextColor="#9CA3AF"
//         multiline={multiline}
//         keyboardType={keyboardType ?? 'default'}
//         autoCapitalize="none"
//       />
//     </View>
//   )
// }

// function SelectField({
//   label,
//   value,
//   onChange,
//   options,
//   hint,
// }: {
//   label: string
//   value: string
//   onChange: (v: string) => void
//   options: { value: string; label: string }[]
//   hint?: string
// }) {
//   const [open, setOpen] = useState(false)
//   const current = options.find(o => o.value === value)

//   return (
//     <View style={styles.fieldWrapper}>
//       <Text style={styles.fieldLabel}>{label}</Text>
//       {hint && <Text style={styles.fieldHint}>{hint}</Text>}
//       <Pressable
//         style={styles.selectButton}
//         onPress={() => setOpen(true)}
//       >
//         <Text style={[styles.selectButtonText, !current?.value && { color: '#9CA3AF' }]}>
//           {current?.label ?? '— select —'}
//         </Text>
//         <Text style={styles.selectChevron}>▾</Text>
//       </Pressable>

//       <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
//         <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
//           <View style={styles.selectSheet}>
//             <Text style={styles.selectSheetTitle}>{label}</Text>
//             {options.map(o => (
//               <Pressable
//                 key={o.value}
//                 style={[styles.selectOption, value === o.value && styles.selectOptionActive]}
//                 onPress={() => { onChange(o.value); setOpen(false) }}
//               >
//                 <Text style={[styles.selectOptionText, value === o.value && styles.selectOptionTextActive]}>
//                   {o.label}
//                 </Text>
//                 {value === o.value && <Text style={styles.selectOptionCheck}>✓</Text>}
//               </Pressable>
//             ))}
//           </View>
//         </Pressable>
//       </Modal>
//     </View>
//   )
// }

// // ── Product Form Modal ─────────────────────────────────────────────────────────

// function ProductFormModal({
//   visible,
//   product,
//   onClose,
//   onSaved,
// }: {
//   visible: boolean
//   product: Product | null   // null = new product
//   onClose: () => void
//   onSaved: (p: Product) => void
// }) {
//   const isNew = !product
//   const [saving, setSaving] = useState(false)
//   const [draft, setDraft] = useState<ProductDraft>(EMPTY_DRAFT)

//   useEffect(() => {
//     if (visible) {
//       setDraft(
//         product
//           ? {
//               name:              product.name,
//               scent:             product.scent,
//               jar_type:          product.jar_type,
//               product_type:      product.product_type,
//               variant_group_id:  product.variant_group_id,
//               price_cents:       product.price_cents,
//               size:              product.size,
//               description:       product.description,
//               inventory_count:   product.inventory_count,
//               metadata:          product.metadata,
//               image_urls:        product.image_urls,
//             }
//           : EMPTY_DRAFT
//       )
//     }
//   }, [visible, product])

//   function set<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
//     setDraft(d => ({ ...d, [key]: value }))
//   }

//   async function handleSave() {
//     if (!draft.name.trim()) {
//       Alert.alert('Validation', 'Product name is required.')
//       return
//     }
//     if (draft.price_cents <= 0) {
//       Alert.alert('Validation', 'Price must be greater than 0.')
//       return
//     }

//     setSaving(true)

//     if (isNew) {
//       const { data, error } = await supabase
//         .from('products')
//         .insert([{ ...draft, id: genUUID() }])
//         .select()
//         .single()
//       setSaving(false)
//       if (error) { Alert.alert('Error', error.message); return }
//       onSaved(data as Product)
//     } else {
//       const { data, error } = await supabase
//         .from('products')
//         .update(draft)
//         .eq('id', product!.id)
//         .select()
//         .single()
//       setSaving(false)
//       if (error) { Alert.alert('Error', error.message); return }
//       onSaved(data as Product)
//     }
//   }

//   // Parse image URLs from newline-separated string
//   const imageUrlsText = (draft.image_urls ?? []).map(i => i.url).join('\n')
//   function handleImageUrlsChange(text: string) {
//     const urls = text.split('\n').map(u => u.trim()).filter(Boolean)
//     set('image_urls', urls.length > 0 ? urls.map((url, i) => ({ url, role: i === 0 ? 'main' : undefined })) : null)
//   }

//   // Parse metadata from JSON string
//   const [metaText, setMetaText] = useState('')
//   const [metaError, setMetaError] = useState(false)
//   useEffect(() => {
//     setMetaText(draft.metadata ? JSON.stringify(draft.metadata, null, 2) : '')
//   }, [visible])
//   function handleMetaChange(text: string) {
//     setMetaText(text)
//     if (!text.trim()) { set('metadata', null); setMetaError(false); return }
//     try { set('metadata', JSON.parse(text)); setMetaError(false) }
//     catch { setMetaError(true) }
//   }

//   return (
//     <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
//       <KeyboardAvoidingView
//         style={{ flex: 1, backgroundColor: '#F9FAFB' }}
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//       >
//         {/* Header */}
//         <View style={styles.formHeader}>
//           <Pressable onPress={onClose} style={styles.formBackBtn}>
//             <Text style={styles.formBackText}>✕</Text>
//           </Pressable>
//           <Text style={styles.formTitle}>{isNew ? 'New product' : 'Edit product'}</Text>
//           <Pressable
//             onPress={handleSave}
//             disabled={saving}
//             style={[styles.formSaveBtn, saving && styles.disabled]}
//           >
//             <Text style={styles.formSaveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
//           </Pressable>
//         </View>

//         <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.formBody}>

//           {/* ── Basic info ─────────────────────────────────────────────── */}
//           <Text style={styles.formSection}>Basic info</Text>

//           <Field
//             label="Product name *"
//             value={draft.name}
//             onChange={v => set('name', v)}
//             placeholder="e.g. Forstheim Amber Jar"
//           />
//           <Field
//             label="Scent / Fragrance"
//             value={draft.scent ?? ''}
//             onChange={v => set('scent', v || null)}
//             placeholder="e.g. Eucalyptus Mint"
//           />
//           <Field
//             label="Description"
//             value={draft.description ?? ''}
//             onChange={v => set('description', v || null)}
//             placeholder="Product description…"
//             multiline
//           />

//           {/* ── Pricing & inventory ────────────────────────────────────── */}
//           <Text style={styles.formSection}>Pricing & inventory</Text>

//           <Field
//             label="Price (in paise / cents) *"
//             value={draft.price_cents > 0 ? String(draft.price_cents) : ''}
//             onChange={v => set('price_cents', parseInt(v || '0', 10))}
//             placeholder="e.g. 40000 for ₹400"
//             keyboardType="numeric"
//             hint="Enter amount × 100. ₹400 → 40000"
//           />
//           <Field
//             label="Size / Capacity"
//             value={draft.size ?? ''}
//             onChange={v => set('size', v || null)}
//             placeholder="e.g. 100 ml, Medium, Large"
//           />
//           <Field
//             label="Inventory count"
//             value={draft.inventory_count !== null ? String(draft.inventory_count) : ''}
//             onChange={v => set('inventory_count', v ? parseInt(v, 10) : null)}
//             placeholder="e.g. 50"
//             keyboardType="numeric"
//           />

//           {/* ── Classification ────────────────────────────────────────── */}
//           <Text style={styles.formSection}>Classification</Text>

//           <SelectField
//             label="Product type"
//             value={draft.product_type ?? ''}
//             onChange={v => set('product_type', v || null)}
//             options={PRODUCT_TYPES}
//           />
//           <SelectField
//             label="Jar type"
//             value={draft.jar_type ?? ''}
//             onChange={v => set('jar_type', v || null)}
//             options={JAR_TYPES}
//           />
//           <Field
//             label="Variant group ID"
//             value={draft.variant_group_id ?? ''}
//             onChange={v => set('variant_group_id', v || null)}
//             placeholder="UUID — leave blank to auto-assign later"
//             hint="Paste an existing group UUID to add to that variant group"
//           />

//           {/* ── Images ────────────────────────────────────────────────── */}
//           <Text style={styles.formSection}>Images</Text>

//           <Field
//             label="Image URLs"
//             value={imageUrlsText}
//             onChange={handleImageUrlsChange}
//             placeholder={'https://…/image1.jpg\nhttps://…/image2.jpg'}
//             multiline
//             hint="One URL per line. First URL becomes the main image."
//           />

//           {/* Preview */}
//           {(draft.image_urls ?? []).length > 0 && (
//             <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
//               {(draft.image_urls ?? []).map((img, i) => (
//                 <View key={i} style={styles.imgPreviewWrap}>
//                   <Image source={{ uri: img.url }} style={styles.imgPreview} resizeMode="cover" />
//                   {img.role === 'main' && (
//                     <View style={styles.imgMainBadge}>
//                       <Text style={styles.imgMainBadgeText}>main</Text>
//                     </View>
//                   )}
//                 </View>
//               ))}
//             </ScrollView>
//           )}

//           {/* ── Metadata ──────────────────────────────────────────────── */}
//           <Text style={styles.formSection}>Metadata (JSON)</Text>

//           <View style={styles.fieldWrapper}>
//             <Text style={styles.fieldLabel}>Metadata</Text>
//             <Text style={styles.fieldHint}>
//               Valid JSON object, e.g. {`{"color":"White","weight":"250g"}`}
//             </Text>
//             <TextInput
//               style={[styles.fieldInput, styles.fieldInputMulti, metaError && styles.fieldInputError]}
//               value={metaText}
//               onChangeText={handleMetaChange}
//               placeholder={'{\n  "color": "White"\n}'}
//               placeholderTextColor="#9CA3AF"
//               multiline
//               autoCapitalize="none"
//             />
//             {metaError && <Text style={styles.fieldErrorText}>Invalid JSON</Text>}
//           </View>

//         </ScrollView>
//       </KeyboardAvoidingView>
//     </Modal>
//   )
// }

// // ── Main Page ──────────────────────────────────────────────────────────────────

// export default function ProductAdminPage() {
    
//   const [products, setProducts]   = useState<Product[]>([])
//   const [loading, setLoading]     = useState(true)
//   const [toast, setToast]         = useState<string | null>(null)
//   const [error, setError]         = useState<string | null>(null)
//   const [search, setSearch]       = useState('')
//   const [filter, setFilter]       = useState<Filter>('all')
//   const [sortKey, setSortKey]     = useState<SortKey>('created_at')
//   const [sortAsc, setSortAsc]     = useState(false)
//   const [editProduct, setEditProduct] = useState<Product | null>(null)
//   const [formVisible, setFormVisible] = useState(false)
//   const [deletingId, setDeletingId]   = useState<string | null>(null)

//   const showToast = useCallback((msg: string) => {
//     setToast(msg)
//     setTimeout(() => setToast(null), 2500)
//   }, [])

//   // ── Load ──────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     load()
//   }, [])

//   async function load() {
//     setLoading(true)
//     const { data, error } = await supabase
//       .from('products')
//       .select('id, name, scent, jar_type, product_type, variant_group_id, price_cents, size, description, inventory_count, metadata, image_urls, created_at')
//       .order('created_at', { ascending: false })
//     if (error) { setError(error.message); setLoading(false); return }
//     setProducts(data ?? [])
//     setLoading(false)
//   }

//   // ── Delete ────────────────────────────────────────────────────────────────
//   function confirmDelete(p: Product) {
//     Alert.alert(
//       'Delete product',
//       `Are you sure you want to delete "${p.name}"? This cannot be undone.`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete', style: 'destructive',
//           onPress: async () => {
//             setDeletingId(p.id)
//             const { error } = await supabase.from('products').delete().eq('id', p.id)
//             setDeletingId(null)
//             if (error) { showToast('Error: ' + error.message); return }
//             setProducts(prev => prev.filter(x => x.id !== p.id))
//             showToast('Product deleted')
//           }
//         }
//       ]
//     )
//   }

//   // ── After save ────────────────────────────────────────────────────────────
//   function handleSaved(saved: Product) {
//     setProducts(prev => {
//       const idx = prev.findIndex(p => p.id === saved.id)
//       if (idx >= 0) {
//         const next = [...prev]
//         next[idx] = saved
//         return next
//       }
//       return [saved, ...prev]
//     })
//     setFormVisible(false)
//     setEditProduct(null)
//     showToast(editProduct ? '✓ Product updated' : '✓ Product created')
//   }

//   // ── Filtered + sorted list ────────────────────────────────────────────────
//   const displayed = products
//     .filter(p => {
//       if (filter !== 'all' && p.product_type !== filter) return false
//       if (search.trim()) {
//         const q = search.toLowerCase()
//         return (
//           p.name.toLowerCase().includes(q) ||
//           (p.scent ?? '').toLowerCase().includes(q) ||
//           (p.description ?? '').toLowerCase().includes(q)
//         )
//       }
//       return true
//     })
//     .sort((a, b) => {
//       let va: any = a[sortKey]
//       let vb: any = b[sortKey]
//       if (sortKey === 'name') { va = va?.toLowerCase(); vb = vb?.toLowerCase() }
//       if (va == null) return 1
//       if (vb == null) return -1
//       return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
//     })

//   // ── Stats ─────────────────────────────────────────────────────────────────
//   const totalValue  = products.reduce((s, p) => s + p.price_cents, 0)
//   const outOfStock  = products.filter(p => p.inventory_count === 0).length
//   const totalStock  = products.reduce((s, p) => s + (p.inventory_count ?? 0), 0)

//   function toggleSort(key: SortKey) {
//     if (sortKey === key) setSortAsc(a => !a)
//     else { setSortKey(key); setSortAsc(true) }
//   }

//   const FILTERS: { value: Filter; label: string }[] = [
//     { value: 'all',        label: 'All' },
//     { value: 'jar',        label: 'Jar & Container' },
//     { value: 'gift-set',   label: 'Gift Set' },
//     { value: 'decorative', label: 'Decorative' },
//   ]

//   const SORTS: { key: SortKey; label: string }[] = [
//     { key: 'created_at',     label: 'Newest' },
//     { key: 'name',           label: 'Name' },
//     { key: 'price_cents',    label: 'Price' },
//     { key: 'inventory_count',label: 'Stock' },
//   ]

//   return (
//     <View style={styles.root}>
//       <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

//         {/* ── Header ─────────────────────────────────────────────────────── */}
//         <View style={styles.header}>
//           <View>
//             <Text style={styles.title}>Product manager</Text>
//             <Text style={styles.subtitle}>View, edit, and create products</Text>
//           </View>
//           <Pressable
//             style={styles.newBtn}
//             onPress={() => { setEditProduct(null); setFormVisible(true) }}
//           >
//             <Text style={styles.newBtnText}>+ New product</Text>
//           </Pressable>
//         </View>

//         {/* ── Stats ──────────────────────────────────────────────────────── */}
//         {!loading && !error && (
//           <View style={styles.statsRow}>
//             {[
//               { label: 'Total products', value: products.length,            color: '#111827' },
//               { label: 'Total stock',    value: totalStock,                  color: '#166534' },
//               { label: 'Out of stock',   value: outOfStock,                  color: '#92400E' },
//               { label: 'Catalog value',  value: formatPrice(totalValue),     color: '#1E40AF' },
//             ].map(s => (
//               <View key={s.label} style={styles.statCard}>
//                 <Text style={styles.statLabel}>{s.label}</Text>
//                 <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
//               </View>
//             ))}
//           </View>
//         )}

//         {/* ── Search ─────────────────────────────────────────────────────── */}
//         {!loading && !error && (
//           <View style={styles.searchRow}>
//             <TextInput
//               style={styles.searchInput}
//               value={search}
//               onChangeText={setSearch}
//               placeholder="Search by name, scent, description…"
//               placeholderTextColor="#9CA3AF"
//               autoCapitalize="none"
//             />
//             {search.length > 0 && (
//               <Pressable onPress={() => setSearch('')} style={styles.searchClear}>
//                 <Text style={{ color: '#6B7280' }}>✕</Text>
//               </Pressable>
//             )}
//           </View>
//         )}

//         {/* ── Filters ────────────────────────────────────────────────────── */}
//         {!loading && !error && (
//           <View style={styles.filterRow}>
//             {FILTERS.map(f => (
//               <Pressable
//                 key={f.value}
//                 onPress={() => setFilter(f.value)}
//                 style={[styles.filterBtn, filter === f.value && styles.filterBtnActive]}
//               >
//                 <Text style={[styles.filterBtnText, filter === f.value && styles.filterBtnTextActive]}>
//                   {f.label}
//                 </Text>
//               </Pressable>
//             ))}
//           </View>
//         )}

//         {/* ── Sort ───────────────────────────────────────────────────────── */}
//         {!loading && !error && (
//           <View style={styles.sortRow}>
//             <Text style={styles.sortLabel}>Sort:</Text>
//             {SORTS.map(s => (
//               <Pressable
//                 key={s.key}
//                 onPress={() => toggleSort(s.key)}
//                 style={[styles.sortBtn, sortKey === s.key && styles.sortBtnActive]}
//               >
//                 <Text style={[styles.sortBtnText, sortKey === s.key && styles.sortBtnTextActive]}>
//                   {s.label} {sortKey === s.key ? (sortAsc ? '↑' : '↓') : ''}
//                 </Text>
//               </Pressable>
//             ))}
//           </View>
//         )}

//         {/* ── Results count ──────────────────────────────────────────────── */}
//         {!loading && !error && (
//           <Text style={styles.resultsCount}>
//             {displayed.length} product{displayed.length !== 1 ? 's' : ''}
//             {search ? ` matching "${search}"` : ''}
//           </Text>
//         )}

//         {/* ── States ─────────────────────────────────────────────────────── */}
//         {loading && <ActivityIndicator style={{ marginTop: 48 }} color="#6B7280" />}
//         {error && (
//           <View style={styles.errorBox}>
//             <Text style={styles.errorText}>Error: {error}</Text>
//           </View>
//         )}
//         {!loading && !error && displayed.length === 0 && (
//           <Text style={styles.emptyText}>No products match this filter.</Text>
//         )}

//         {/* ── Product cards ───────────────────────────────────────────────── */}
//         {displayed.map(p => {
//           const imgUrl = getMainImage(p)
//           const isDeleting = deletingId === p.id

//           return (
//             <View key={p.id} style={styles.card}>
//               <View style={styles.cardRow}>

//                 {/* Thumbnail */}
//                 {imgUrl ? (
//                   <Image source={{ uri: imgUrl }} style={styles.cardThumb} resizeMode="cover" />
//                 ) : (
//                   <View style={[styles.cardThumb, styles.cardThumbEmpty]}>
//                     <Text style={styles.cardThumbEmptyText}>No{'\n'}image</Text>
//                   </View>
//                 )}

//                 {/* Main info */}
//                 <View style={{ flex: 1, gap: 6 }}>
//                   <View style={styles.cardTitleRow}>
//                     <Text style={styles.cardName} numberOfLines={1}>{p.name}</Text>
//                     <Text style={styles.cardPrice}>{formatPrice(p.price_cents)}</Text>
//                   </View>

//                   {p.scent && (
//                     <Text style={styles.cardScent}>{p.scent}</Text>
//                   )}

//                   <View style={styles.cardPillRow}>
//                     <JarPill value={p.jar_type} />
//                     <StockBadge count={p.inventory_count} />
//                     {p.size && (
//                       <View style={styles.sizePill}>
//                         <Text style={styles.sizePillText}>{p.size}</Text>
//                       </View>
//                     )}
//                   </View>

//                   {p.description && (
//                     <Text style={styles.cardDesc} numberOfLines={2}>{p.description}</Text>
//                   )}

//                   <View style={styles.cardMeta}>
//                     <Text style={styles.cardMetaText}>
//                       {p.product_type ?? 'no type'}  ·  {timeAgo(p.created_at)}
//                     </Text>
//                     {p.variant_group_id && (
//                       <Text style={styles.cardMetaText}>
//                         Group: {p.variant_group_id.slice(0, 8)}…
//                       </Text>
//                     )}
//                   </View>
//                 </View>
//               </View>

//               {/* Actions */}
//               <View style={styles.cardActions}>
//                 <Pressable
//                   style={styles.editBtn}
//                   onPress={() => { setEditProduct(p); setFormVisible(true) }}
//                 >
//                   <Text style={styles.editBtnText}>Edit</Text>
//                 </Pressable>
//                 <Pressable
//                   style={[styles.deleteBtn, isDeleting && styles.disabled]}
//                   disabled={isDeleting}
//                   onPress={() => confirmDelete(p)}
//                 >
//                   <Text style={styles.deleteBtnText}>{isDeleting ? 'Deleting…' : 'Delete'}</Text>
//                 </Pressable>
//               </View>
//             </View>
//           )
//         })}

//         <View style={{ height: 40 }} />
//       </ScrollView>

//       {/* ── Form modal ───────────────────────────────────────────────────── */}
//       <ProductFormModal
//         visible={formVisible}
//         product={editProduct}
//         onClose={() => { setFormVisible(false); setEditProduct(null) }}
//         onSaved={handleSaved}
//       />

//       <Toast message={toast} />
//     </View>
//   )
// }

// // ── Styles ─────────────────────────────────────────────────────────────────────

// const styles = StyleSheet.create({
//   root: { flex: 1, backgroundColor: '#F9FAFB' },
//   scroll: { flex: 1 },
//   container: { paddingHorizontal: 20, paddingTop: 24, maxWidth: 960, alignSelf: 'center', width: '100%' },

//   header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
//   title: { fontSize: 22, fontWeight: '600', color: '#111827' },
//   subtitle: { fontSize: 13, color: '#6B7280', marginTop: 3 },
//   newBtn: { backgroundColor: '#111827', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
//   newBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

//   statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
//   statCard: { flex: 1, minWidth: 100, backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: '#E5E7EB', padding: 14 },
//   statLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
//   statValue: { fontSize: 20, fontWeight: '600' },

//   searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, borderWidth: 0.5, borderColor: '#E5E7EB', marginBottom: 12, paddingHorizontal: 12 },
//   searchInput: { flex: 1, fontSize: 14, color: '#111827', paddingVertical: 10 },
//   searchClear: { padding: 4 },

//   filterRow: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
//   filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, borderColor: '#D1D5DB', backgroundColor: '#fff' },
//   filterBtnActive: { backgroundColor: '#111827', borderColor: '#111827' },
//   filterBtnText: { fontSize: 13, color: '#6B7280' },
//   filterBtnTextActive: { color: '#fff', fontWeight: '500' },

//   sortRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
//   sortLabel: { fontSize: 12, color: '#9CA3AF' },
//   sortBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 0.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
//   sortBtnActive: { borderColor: '#111827', backgroundColor: '#F9FAFB' },
//   sortBtnText: { fontSize: 12, color: '#6B7280' },
//   sortBtnTextActive: { color: '#111827', fontWeight: '600' },

//   resultsCount: { fontSize: 12, color: '#9CA3AF', marginBottom: 12 },

//   card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: '#E5E7EB', marginBottom: 10, overflow: 'hidden' },
//   cardRow: { flexDirection: 'row', gap: 12, padding: 14 },
//   cardThumb: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#F3F4F6' },
//   cardThumbEmpty: { alignItems: 'center', justifyContent: 'center' },
//   cardThumbEmptyText: { fontSize: 9, color: '#9CA3AF', textAlign: 'center' },

//   cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
//   cardName: { fontSize: 14, fontWeight: '600', color: '#111827', flex: 1 },
//   cardPrice: { fontSize: 14, fontWeight: '600', color: '#111827' },
//   cardScent: { fontSize: 12, color: '#6B7280' },
//   cardPillRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
//   cardDesc: { fontSize: 12, color: '#9CA3AF', lineHeight: 17 },
//   cardMeta: { gap: 2 },
//   cardMetaText: { fontSize: 11, color: '#D1D5DB', fontFamily: Platform.OS === 'web' ? 'monospace' : undefined },

//   cardActions: { flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: '#F3F4F6', paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
//   editBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 8, backgroundColor: '#F9FAFB', borderWidth: 0.5, borderColor: '#E5E7EB' },
//   editBtnText: { fontSize: 13, color: '#374151', fontWeight: '500' },
//   deleteBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 8, backgroundColor: '#FEF2F2', borderWidth: 0.5, borderColor: '#FECACA' },
//   deleteBtnText: { fontSize: 13, color: '#991B1B', fontWeight: '500' },

//   pill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
//   pillText: { fontSize: 11, fontWeight: '500' },

//   badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, alignSelf: 'flex-start' },
//   badgeGreen: { backgroundColor: '#DCFCE7' },
//   badgeGreenText: { fontSize: 11, color: '#166534', fontWeight: '500' },
//   badgeAmber: { backgroundColor: '#FEF3C7' },
//   badgeAmberText: { fontSize: 11, color: '#92400E', fontWeight: '500' },
//   badgeRed: { backgroundColor: '#FEF2F2' },
//   badgeRedText: { fontSize: 11, color: '#991B1B', fontWeight: '500' },
//   badgeGray: { backgroundColor: '#F3F4F6' },
//   badgeGrayText: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },

//   sizePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, backgroundColor: '#F3F4F6' },
//   sizePillText: { fontSize: 11, color: '#4B5563', fontWeight: '500' },

//   // ── Form modal ──────────────────────────────────────────────────────────────
//   formHeader: {
//     flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
//     paddingHorizontal: 20, paddingVertical: 14,
//     backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB',
//     ...(Platform.OS === 'web' ? {} : { paddingTop: 52 }),
//   },
//   formBackBtn: { padding: 4 },
//   formBackText: { fontSize: 16, color: '#6B7280' },
//   formTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
//   formSaveBtn: { backgroundColor: '#111827', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8 },
//   formSaveBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
//   formBody: { paddingHorizontal: 20, paddingBottom: 60 },
//   formSection: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 28, marginBottom: 12 },

//   fieldWrapper: { marginBottom: 16 },
//   fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4 },
//   fieldHint: { fontSize: 11, color: '#9CA3AF', marginBottom: 6 },
//   fieldInput: {
//     backgroundColor: '#fff', borderRadius: 8, borderWidth: 0.5, borderColor: '#D1D5DB',
//     paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#111827',
//   },
//   fieldInputMulti: { minHeight: 90, textAlignVertical: 'top' },
//   fieldInputError: { borderColor: '#F87171' },
//   fieldErrorText: { fontSize: 12, color: '#EF4444', marginTop: 4 },

//   selectButton: {
//     flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
//     backgroundColor: '#fff', borderRadius: 8, borderWidth: 0.5, borderColor: '#D1D5DB',
//     paddingHorizontal: 12, paddingVertical: 10,
//   },
//   selectButtonText: { fontSize: 14, color: '#111827' },
//   selectChevron: { fontSize: 14, color: '#9CA3AF' },

//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
//   selectSheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 32 },
//   selectSheetTitle: { fontSize: 13, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, padding: 16, paddingBottom: 8 },
//   selectOption: { paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
//   selectOptionActive: { backgroundColor: '#F9FAFB' },
//   selectOptionText: { fontSize: 15, color: '#111827' },
//   selectOptionTextActive: { fontWeight: '600' },
//   selectOptionCheck: { fontSize: 14, color: '#111827' },

//   imgPreviewWrap: { marginRight: 8, position: 'relative' },
//   imgPreview: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#F3F4F6' },
//   imgMainBadge: { position: 'absolute', bottom: 4, left: 4, backgroundColor: '#111827', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
//   imgMainBadgeText: { fontSize: 9, color: '#fff', fontWeight: '600' },

//   toast: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: '#111827', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
//   toastText: { color: '#fff', fontSize: 13 },

//   errorBox: { backgroundColor: '#FEF2F2', borderRadius: 10, borderWidth: 0.5, borderColor: '#FECACA', padding: 14, marginTop: 16 },
//   errorText: { color: '#991B1B', fontSize: 13 },
//   emptyText: { textAlign: 'center', color: '#9CA3AF', fontSize: 14, marginTop: 48 },
//   disabled: { opacity: 0.4 },
// })
// app/admin/products/index.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  StyleSheet,
  Platform,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Alert,
} from 'react-native'
import { createClient } from '@supabase/supabase-js'
import { useAdminAuth } from '../../../hooks/useAdminAuth'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

// ── Constants ──────────────────────────────────────────────────────────────────

const JAR_TYPES = [
  { value: '', label: '— unset —' },
  { value: 'amber-jar', label: 'Amber Jar' },
  { value: 'wooden-lid', label: 'Wooden Lid' },
  { value: 'car-diffuser', label: 'Car Diffuser' },
  { value: 'wardrobe-sachet', label: 'Wardrobe Sachet' },
  { value: 'reed-diffuser', label: 'Reed Diffuser' },
  { value: 'wax-melt', label: 'Wax Melt' },
  { value: 'decor', label: 'Decor' },
  { value: 'bouquet', label: 'Bouquet' },
  { value: 'other', label: 'Other' },
]

const PRODUCT_TYPES = [
  { value: '', label: '— unset —' },
  { value: 'jar', label: 'Jar & Container' },
  { value: 'gift-set', label: 'Gift Set' },
  { value: 'decorative', label: 'Decorative' },
]

// ── Types ──────────────────────────────────────────────────────────────────────

type ImageEntry = { url: string; alt?: string; role?: string }

type Product = {
  id: string
  name: string
  scent: string | null
  jar_type: string | null
  product_type: string | null
  variant_group_id: string | null
  price_cents: number
  size: string | null
  description: string | null
  inventory_count: number | null
  metadata: Record<string, unknown> | null
  image_urls: ImageEntry[] | null
  created_at: string | null
}

type ProductDraft = Omit<Product, 'id' | 'created_at'>

const EMPTY_DRAFT: ProductDraft = {
  name: '',
  scent: null,
  jar_type: null,
  product_type: null,
  variant_group_id: null,
  price_cents: 0,
  size: null,
  description: null,
  inventory_count: null,
  metadata: null,
  image_urls: null,
}

type Filter = 'all' | 'jar' | 'gift-set' | 'decorative'
type SortKey = 'created_at' | 'name' | 'price_cents' | 'inventory_count'

// ── Helpers ────────────────────────────────────────────────────────────────────

function genUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function getMainImage(product: Product): string | null {
  if (!product.image_urls || product.image_urls.length === 0) return null
  const main = product.image_urls.find((img) => img.role === 'main')
  return (main ?? product.image_urls[0]).url
}

function formatPrice(cents: number) {
  return `₹${(cents / 100).toFixed(0)}`
}

function timeAgo(iso: string | null) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Toast({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <View style={styles.toast} pointerEvents="none">
      <Text style={styles.toastText}>{message}</Text>
    </View>
  )
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

function StockBadge({ count }: { count: number | null }) {
  if (count === null) return <View style={[styles.badge, styles.badgeGray]}><Text style={styles.badgeGrayText}>—</Text></View>
  if (count === 0)    return <View style={[styles.badge, styles.badgeRed]}><Text style={styles.badgeRedText}>Out of stock</Text></View>
  if (count <= 5)     return <View style={[styles.badge, styles.badgeAmber]}><Text style={styles.badgeAmberText}>Low: {count}</Text></View>
  return <View style={[styles.badge, styles.badgeGreen]}><Text style={styles.badgeGreenText}>{count} in stock</Text></View>
}

// ── Form field components ──────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  keyboardType,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  multiline?: boolean
  keyboardType?: 'default' | 'numeric' | 'decimal-pad'
  hint?: string
}) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {hint && <Text style={styles.fieldHint}>{hint}</Text>}
      <TextInput
        style={[styles.fieldInput, multiline && styles.fieldInputMulti]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? ''}
        placeholderTextColor="#9CA3AF"
        multiline={multiline}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize="none"
      />
    </View>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  hint?: string
}) {
  const [open, setOpen] = useState(false)
  const current = options.find(o => o.value === value)

  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {hint && <Text style={styles.fieldHint}>{hint}</Text>}
      <Pressable
        style={styles.selectButton}
        onPress={() => setOpen(true)}
      >
        <Text style={[styles.selectButtonText, !current?.value && { color: '#9CA3AF' }]}>
          {current?.label ?? '— select —'}
        </Text>
        <Text style={styles.selectChevron}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <View style={styles.selectSheet}>
            <Text style={styles.selectSheetTitle}>{label}</Text>
            {options.map(o => (
              <Pressable
                key={o.value}
                style={[styles.selectOption, value === o.value && styles.selectOptionActive]}
                onPress={() => { onChange(o.value); setOpen(false) }}
              >
                <Text style={[styles.selectOptionText, value === o.value && styles.selectOptionTextActive]}>
                  {o.label}
                </Text>
                {value === o.value && <Text style={styles.selectOptionCheck}>✓</Text>}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

// ── Product Form Modal ─────────────────────────────────────────────────────────

function ProductFormModal({
  visible,
  product,
  onClose,
  onSaved,
}: {
  visible: boolean
  product: Product | null
  onClose: () => void
  onSaved: (p: Product) => void
}) {
  const isNew = !product
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<ProductDraft>(EMPTY_DRAFT)

  useEffect(() => {
    if (visible) {
      setDraft(
        product
          ? {
              name:              product.name,
              scent:             product.scent,
              jar_type:          product.jar_type,
              product_type:      product.product_type,
              variant_group_id:  product.variant_group_id,
              price_cents:       product.price_cents,
              size:              product.size,
              description:       product.description,
              inventory_count:   product.inventory_count,
              metadata:          product.metadata,
              image_urls:        product.image_urls,
            }
          : EMPTY_DRAFT
      )
    }
  }, [visible, product])

  function set<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft(d => ({ ...d, [key]: value }))
  }

  async function handleSave() {
    if (!draft.name.trim()) {
      Alert.alert('Validation', 'Product name is required.')
      return
    }
    if (draft.price_cents <= 0) {
      Alert.alert('Validation', 'Price must be greater than 0.')
      return
    }

    setSaving(true)

    if (isNew) {
      const { data, error } = await supabase
        .from('products')
        .insert([{ ...draft, id: genUUID() }])
        .select()
        .single()
      setSaving(false)
      if (error) { Alert.alert('Error', error.message); return }
      onSaved(data as Product)
    } else {
      const { data, error } = await supabase
        .from('products')
        .update(draft)
        .eq('id', product!.id)
        .select()
        .single()
      setSaving(false)
      if (error) { Alert.alert('Error', error.message); return }
      onSaved(data as Product)
    }
  }

  const imageUrlsText = (draft.image_urls ?? []).map(i => i.url).join('\n')
  function handleImageUrlsChange(text: string) {
    const urls = text.split('\n').map(u => u.trim()).filter(Boolean)
    set('image_urls', urls.length > 0 ? urls.map((url, i) => ({ url, role: i === 0 ? 'main' : undefined })) : null)
  }

  const [metaText, setMetaText] = useState('')
  const [metaError, setMetaError] = useState(false)
  useEffect(() => {
    setMetaText(draft.metadata ? JSON.stringify(draft.metadata, null, 2) : '')
  }, [visible])
  function handleMetaChange(text: string) {
    setMetaText(text)
    if (!text.trim()) { set('metadata', null); setMetaError(false); return }
    try { set('metadata', JSON.parse(text)); setMetaError(false) }
    catch { setMetaError(true) }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#F9FAFB' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.formHeader}>
          <Pressable onPress={onClose} style={styles.formBackBtn}>
            <Text style={styles.formBackText}>✕</Text>
          </Pressable>
          <Text style={styles.formTitle}>{isNew ? 'New product' : 'Edit product'}</Text>
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[styles.formSaveBtn, saving && styles.disabled]}
          >
            <Text style={styles.formSaveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
          </Pressable>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.formBody}>
          <Text style={styles.formSection}>Basic info</Text>
          <Field label="Product name *" value={draft.name} onChange={v => set('name', v)} placeholder="e.g. Forstheim Amber Jar" />
          <Field label="Scent / Fragrance" value={draft.scent ?? ''} onChange={v => set('scent', v || null)} placeholder="e.g. Eucalyptus Mint" />
          <Field label="Description" value={draft.description ?? ''} onChange={v => set('description', v || null)} placeholder="Product description…" multiline />

          <Text style={styles.formSection}>Pricing & inventory</Text>
          <Field label="Price (in paise / cents) *" value={draft.price_cents > 0 ? String(draft.price_cents) : ''} onChange={v => set('price_cents', parseInt(v || '0', 10))} placeholder="e.g. 40000 for ₹400" keyboardType="numeric" hint="Enter amount × 100. ₹400 → 40000" />
          <Field label="Size / Capacity" value={draft.size ?? ''} onChange={v => set('size', v || null)} placeholder="e.g. 100 ml, Medium, Large" />
          <Field label="Inventory count" value={draft.inventory_count !== null ? String(draft.inventory_count) : ''} onChange={v => set('inventory_count', v ? parseInt(v, 10) : null)} placeholder="e.g. 50" keyboardType="numeric" />

          <Text style={styles.formSection}>Classification</Text>
          <SelectField label="Product type" value={draft.product_type ?? ''} onChange={v => set('product_type', v || null)} options={PRODUCT_TYPES} />
          <SelectField label="Jar type" value={draft.jar_type ?? ''} onChange={v => set('jar_type', v || null)} options={JAR_TYPES} />
          <Field label="Variant group ID" value={draft.variant_group_id ?? ''} onChange={v => set('variant_group_id', v || null)} placeholder="UUID — leave blank to auto-assign later" hint="Paste an existing group UUID to add to that variant group" />

          <Text style={styles.formSection}>Images</Text>
          <Field label="Image URLs" value={imageUrlsText} onChange={handleImageUrlsChange} placeholder={'https://…/image1.jpg\nhttps://…/image2.jpg'} multiline hint="One URL per line. First URL becomes the main image." />

          {(draft.image_urls ?? []).length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              {(draft.image_urls ?? []).map((img, i) => (
                <View key={i} style={styles.imgPreviewWrap}>
                  <Image source={{ uri: img.url }} style={styles.imgPreview} resizeMode="cover" />
                  {img.role === 'main' && (
                    <View style={styles.imgMainBadge}>
                      <Text style={styles.imgMainBadgeText}>main</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}

          <Text style={styles.formSection}>Metadata (JSON)</Text>
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Metadata</Text>
            <Text style={styles.fieldHint}>Valid JSON object, e.g. {`{"color":"White","weight":"250g"}`}</Text>
            <TextInput
              style={[styles.fieldInput, styles.fieldInputMulti, metaError && styles.fieldInputError]}
              value={metaText}
              onChangeText={handleMetaChange}
              placeholder={'{\n  "color": "White"\n}'}
              placeholderTextColor="#9CA3AF"
              multiline
              autoCapitalize="none"
            />
            {metaError && <Text style={styles.fieldErrorText}>Invalid JSON</Text>}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ProductAdminPage() {
  // ── ALL HOOKS FIRST ───────────────────────────────────────────────────────
  const authState = useAdminAuth()

  const [products, setProducts]       = useState<Product[]>([])
  const [loading, setLoading]         = useState(true)
  const [toast, setToast]             = useState<string | null>(null)
  const [error, setError]             = useState<string | null>(null)
  const [search, setSearch]           = useState('')
  const [filter, setFilter]           = useState<Filter>('all')
  const [sortKey, setSortKey]         = useState<SortKey>('created_at')
  const [sortAsc, setSortAsc]         = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [formVisible, setFormVisible] = useState(false)
  const [deletingId, setDeletingId]   = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [])

  useEffect(() => {
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

  // ── FUNCTIONS (safe to define after hook section) ─────────────────────────

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('id, name, scent, jar_type, product_type, variant_group_id, price_cents, size, description, inventory_count, metadata, image_urls, created_at')
      .order('created_at', { ascending: false })
    if (error) { setError(error.message); setLoading(false); return }
    setProducts(data ?? [])
    setLoading(false)
  }

  function confirmDelete(p: Product) {
    Alert.alert(
      'Delete product',
      `Are you sure you want to delete "${p.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            setDeletingId(p.id)
            const { error } = await supabase.from('products').delete().eq('id', p.id)
            setDeletingId(null)
            if (error) { showToast('Error: ' + error.message); return }
            setProducts(prev => prev.filter(x => x.id !== p.id))
            showToast('Product deleted')
          }
        }
      ]
    )
  }

  function handleSaved(saved: Product) {
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [saved, ...prev]
    })
    setFormVisible(false)
    setEditProduct(null)
    showToast(editProduct ? '✓ Product updated' : '✓ Product created')
  }

  const displayed = products
    .filter(p => {
      if (filter !== 'all' && p.product_type !== filter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          (p.scent ?? '').toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q)
        )
      }
      return true
    })
    .sort((a, b) => {
      let va: any = a[sortKey]
      let vb: any = b[sortKey]
      if (sortKey === 'name') { va = va?.toLowerCase(); vb = vb?.toLowerCase() }
      if (va == null) return 1
      if (vb == null) return -1
      return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })

  const totalValue = products.reduce((s, p) => s + p.price_cents, 0)
  const outOfStock = products.filter(p => p.inventory_count === 0).length
  const totalStock = products.reduce((s, p) => s + (p.inventory_count ?? 0), 0)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(true) }
  }

  const FILTERS: { value: Filter; label: string }[] = [
    { value: 'all',        label: 'All' },
    { value: 'jar',        label: 'Jar & Container' },
    { value: 'gift-set',   label: 'Gift Set' },
    { value: 'decorative', label: 'Decorative' },
  ]

  const SORTS: { key: SortKey; label: string }[] = [
    { key: 'created_at',      label: 'Newest' },
    { key: 'name',            label: 'Name' },
    { key: 'price_cents',     label: 'Price' },
    { key: 'inventory_count', label: 'Stock' },
  ]

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Product manager</Text>
            <Text style={styles.subtitle}>View, edit, and create products</Text>
          </View>
          <Pressable
            style={styles.newBtn}
            onPress={() => { setEditProduct(null); setFormVisible(true) }}
          >
            <Text style={styles.newBtnText}>+ New product</Text>
          </Pressable>
        </View>

        {!loading && !error && (
          <View style={styles.statsRow}>
            {[
              { label: 'Total products', value: products.length,        color: '#111827' },
              { label: 'Total stock',    value: totalStock,              color: '#166534' },
              { label: 'Out of stock',   value: outOfStock,              color: '#92400E' },
              { label: 'Catalog value',  value: formatPrice(totalValue), color: '#1E40AF' },
            ].map(s => (
              <View key={s.label} style={styles.statCard}>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              </View>
            ))}
          </View>
        )}

        {!loading && !error && (
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name, scent, description…"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} style={styles.searchClear}>
                <Text style={{ color: '#6B7280' }}>✕</Text>
              </Pressable>
            )}
          </View>
        )}

        {!loading && !error && (
          <View style={styles.filterRow}>
            {FILTERS.map(f => (
              <Pressable
                key={f.value}
                onPress={() => setFilter(f.value)}
                style={[styles.filterBtn, filter === f.value && styles.filterBtnActive]}
              >
                <Text style={[styles.filterBtnText, filter === f.value && styles.filterBtnTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {!loading && !error && (
          <View style={styles.sortRow}>
            <Text style={styles.sortLabel}>Sort:</Text>
            {SORTS.map(s => (
              <Pressable
                key={s.key}
                onPress={() => toggleSort(s.key)}
                style={[styles.sortBtn, sortKey === s.key && styles.sortBtnActive]}
              >
                <Text style={[styles.sortBtnText, sortKey === s.key && styles.sortBtnTextActive]}>
                  {s.label} {sortKey === s.key ? (sortAsc ? '↑' : '↓') : ''}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {!loading && !error && (
          <Text style={styles.resultsCount}>
            {displayed.length} product{displayed.length !== 1 ? 's' : ''}
            {search ? ` matching "${search}"` : ''}
          </Text>
        )}

        {loading && <ActivityIndicator style={{ marginTop: 48 }} color="#6B7280" />}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}
        {!loading && !error && displayed.length === 0 && (
          <Text style={styles.emptyText}>No products match this filter.</Text>
        )}

        {displayed.map(p => {
          const imgUrl = getMainImage(p)
          const isDeleting = deletingId === p.id

          return (
            <View key={p.id} style={styles.card}>
              <View style={styles.cardRow}>
                {imgUrl ? (
                  <Image source={{ uri: imgUrl }} style={styles.cardThumb} resizeMode="cover" />
                ) : (
                  <View style={[styles.cardThumb, styles.cardThumbEmpty]}>
                    <Text style={styles.cardThumbEmptyText}>No{'\n'}image</Text>
                  </View>
                )}

                <View style={{ flex: 1, gap: 6 }}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardName} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.cardPrice}>{formatPrice(p.price_cents)}</Text>
                  </View>

                  {p.scent && <Text style={styles.cardScent}>{p.scent}</Text>}

                  <View style={styles.cardPillRow}>
                    <JarPill value={p.jar_type} />
                    <StockBadge count={p.inventory_count} />
                    {p.size && (
                      <View style={styles.sizePill}>
                        <Text style={styles.sizePillText}>{p.size}</Text>
                      </View>
                    )}
                  </View>

                  {p.description && (
                    <Text style={styles.cardDesc} numberOfLines={2}>{p.description}</Text>
                  )}

                  <View style={styles.cardMeta}>
                    <Text style={styles.cardMetaText}>
                      {p.product_type ?? 'no type'}  ·  {timeAgo(p.created_at)}
                    </Text>
                    {p.variant_group_id && (
                      <Text style={styles.cardMetaText}>
                        Group: {p.variant_group_id.slice(0, 8)}…
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.cardActions}>
                <Pressable
                  style={styles.editBtn}
                  onPress={() => { setEditProduct(p); setFormVisible(true) }}
                >
                  <Text style={styles.editBtnText}>Edit</Text>
                </Pressable>
                <Pressable
                  style={[styles.deleteBtn, isDeleting && styles.disabled]}
                  disabled={isDeleting}
                  onPress={() => confirmDelete(p)}
                >
                  <Text style={styles.deleteBtnText}>{isDeleting ? 'Deleting…' : 'Delete'}</Text>
                </Pressable>
              </View>
            </View>
          )
        })}

        <View style={{ height: 40 }} />
      </ScrollView>

      <ProductFormModal
        visible={formVisible}
        product={editProduct}
        onClose={() => { setFormVisible(false); setEditProduct(null) }}
        onSaved={handleSaved}
      />

      <Toast message={toast} />
    </View>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { flex: 1 },
  container: { paddingHorizontal: 20, paddingTop: 24, maxWidth: 960, alignSelf: 'center', width: '100%' },

  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 22, fontWeight: '600', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 3 },
  newBtn: { backgroundColor: '#111827', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  newBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  statCard: { flex: 1, minWidth: 100, backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: '#E5E7EB', padding: 14 },
  statLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '600' },

  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, borderWidth: 0.5, borderColor: '#E5E7EB', marginBottom: 12, paddingHorizontal: 12 },
  searchInput: { flex: 1, fontSize: 14, color: '#111827', paddingVertical: 10 },
  searchClear: { padding: 4 },

  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, borderColor: '#D1D5DB', backgroundColor: '#fff' },
  filterBtnActive: { backgroundColor: '#111827', borderColor: '#111827' },
  filterBtnText: { fontSize: 13, color: '#6B7280' },
  filterBtnTextActive: { color: '#fff', fontWeight: '500' },

  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  sortLabel: { fontSize: 12, color: '#9CA3AF' },
  sortBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 0.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  sortBtnActive: { borderColor: '#111827', backgroundColor: '#F9FAFB' },
  sortBtnText: { fontSize: 12, color: '#6B7280' },
  sortBtnTextActive: { color: '#111827', fontWeight: '600' },

  resultsCount: { fontSize: 12, color: '#9CA3AF', marginBottom: 12 },

  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: '#E5E7EB', marginBottom: 10, overflow: 'hidden' },
  cardRow: { flexDirection: 'row', gap: 12, padding: 14 },
  cardThumb: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#F3F4F6' },
  cardThumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  cardThumbEmptyText: { fontSize: 9, color: '#9CA3AF', textAlign: 'center' },

  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardName: { fontSize: 14, fontWeight: '600', color: '#111827', flex: 1 },
  cardPrice: { fontSize: 14, fontWeight: '600', color: '#111827' },
  cardScent: { fontSize: 12, color: '#6B7280' },
  cardPillRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  cardDesc: { fontSize: 12, color: '#9CA3AF', lineHeight: 17 },
  cardMeta: { gap: 2 },
  cardMetaText: { fontSize: 11, color: '#D1D5DB', fontFamily: Platform.OS === 'web' ? 'monospace' : undefined },

  cardActions: { flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: '#F3F4F6', paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  editBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 8, backgroundColor: '#F9FAFB', borderWidth: 0.5, borderColor: '#E5E7EB' },
  editBtnText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  deleteBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 8, backgroundColor: '#FEF2F2', borderWidth: 0.5, borderColor: '#FECACA' },
  deleteBtnText: { fontSize: 13, color: '#991B1B', fontWeight: '500' },

  pill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  pillText: { fontSize: 11, fontWeight: '500' },

  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, alignSelf: 'flex-start' },
  badgeGreen: { backgroundColor: '#DCFCE7' },
  badgeGreenText: { fontSize: 11, color: '#166534', fontWeight: '500' },
  badgeAmber: { backgroundColor: '#FEF3C7' },
  badgeAmberText: { fontSize: 11, color: '#92400E', fontWeight: '500' },
  badgeRed: { backgroundColor: '#FEF2F2' },
  badgeRedText: { fontSize: 11, color: '#991B1B', fontWeight: '500' },
  badgeGray: { backgroundColor: '#F3F4F6' },
  badgeGrayText: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },

  sizePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, backgroundColor: '#F3F4F6' },
  sizePillText: { fontSize: 11, color: '#4B5563', fontWeight: '500' },

  formHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB',
    ...(Platform.OS === 'web' ? {} : { paddingTop: 52 }),
  },
  formBackBtn: { padding: 4 },
  formBackText: { fontSize: 16, color: '#6B7280' },
  formTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  formSaveBtn: { backgroundColor: '#111827', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8 },
  formSaveBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  formBody: { paddingHorizontal: 20, paddingBottom: 60 },
  formSection: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 28, marginBottom: 12 },

  fieldWrapper: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4 },
  fieldHint: { fontSize: 11, color: '#9CA3AF', marginBottom: 6 },
  fieldInput: {
    backgroundColor: '#fff', borderRadius: 8, borderWidth: 0.5, borderColor: '#D1D5DB',
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#111827',
  },
  fieldInputMulti: { minHeight: 90, textAlignVertical: 'top' },
  fieldInputError: { borderColor: '#F87171' },
  fieldErrorText: { fontSize: 12, color: '#EF4444', marginTop: 4 },

  selectButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 8, borderWidth: 0.5, borderColor: '#D1D5DB',
    paddingHorizontal: 12, paddingVertical: 10,
  },
  selectButtonText: { fontSize: 14, color: '#111827' },
  selectChevron: { fontSize: 14, color: '#9CA3AF' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  selectSheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 32 },
  selectSheetTitle: { fontSize: 13, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, padding: 16, paddingBottom: 8 },
  selectOption: { paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectOptionActive: { backgroundColor: '#F9FAFB' },
  selectOptionText: { fontSize: 15, color: '#111827' },
  selectOptionTextActive: { fontWeight: '600' },
  selectOptionCheck: { fontSize: 14, color: '#111827' },

  imgPreviewWrap: { marginRight: 8, position: 'relative' },
  imgPreview: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#F3F4F6' },
  imgMainBadge: { position: 'absolute', bottom: 4, left: 4, backgroundColor: '#111827', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  imgMainBadgeText: { fontSize: 9, color: '#fff', fontWeight: '600' },

  toast: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: '#111827', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  toastText: { color: '#fff', fontSize: 13 },

  errorBox: { backgroundColor: '#FEF2F2', borderRadius: 10, borderWidth: 0.5, borderColor: '#FECACA', padding: 14, marginTop: 16 },
  errorText: { color: '#991B1B', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#9CA3AF', fontSize: 14, marginTop: 48 },
  disabled: { opacity: 0.4 },
})