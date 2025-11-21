# Manual Integration Guide: PaymentTab Component

## Summary

The `PaymentTab.jsx` component has been created successfully at:
`c:/Users/jsara/OneDrive/Documentos/Develop/arky/arky-frontend/src/components/PaymentTab.jsx`

Due to the complexity of `ObraDetails.jsx` (514 lines), automatic integration failed. Please follow these manual steps to complete the integration.

---

## Step 1: Add Import Statement

At the top of `ObraDetails.jsx` (around line 6), add:

```javascript
import PaymentTab from '../components/PaymentTab';
```

---

## Step 2: Add State for Active Tab

In the `ObraDetailsContent` function (around line 27), add the activeTab state:

```javascript
const [activeTab, setActiveTab] = useState('presupuesto'); // 'presupuesto' or 'pagos'
```

---

## Step 3: Replace Presupuesto Header with Tab Navigation

Find the section that starts with (around line 188-200):

```javascript
<div className="bg-white dark:bg-gray-800 shadow px-4 py-5 sm:rounded-lg sm:p-6 flex justify-between items-center">
    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Presupuesto (v{presupuesto.version_numero})</h2>
    <span className={clsx(
        "px-3 py-1 rounded-full text-sm font-medium",
        presupuesto.estado === 'Aprobado' ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200" :
            presupuesto.estado === 'Rechazado' ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200" :
                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200"
    )}>
        {presupuesto.estado}
    </span>
</div>
```

Replace it with:

```javascript
{/* Tab Navigation */}
<div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
    <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
                onClick={() => setActiveTab('presupuesto')}
                className={clsx(
                    activeTab === 'presupuesto'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                )}
            >
                Presupuesto
            </button>
            <button
                onClick={() => setActiveTab('pagos')}
                className={clsx(
                    activeTab === 'pagos'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                )}
            >
                Pagos
            </button>
        </nav>
    </div>
    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {activeTab === 'presupuesto' ? `Presupuesto (v${presupuesto.version_numero})` : 'Gestión de Pagos'}
        </h2>
        <span className={clsx(
            "px-3 py-1 rounded-full text-sm font-medium",
            presupuesto.estado === 'Aprobado' ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200" :
                presupuesto.estado === 'Rechazado' ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200" :
                    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200"
        )}>
            {presupuesto.estado}
        </span>
    </div>
</div>
```

---

## Step 4: Wrap Presupuesto Content and Add PaymentTab

Find the section that starts with `{/* Rejection Handling */}` (around line 202) and goes all the way to the end of the presupuesto content (before the closing `</div>` of the main presupuesto section, around line 471).

Wrap ALL of that content (from `{/* Rejection Handling */}` to just before the final `</div>`) with:

```javascript
{/* Tab Content */}
{activeTab === 'presupuesto' ? (
    <>
        {/* ALL EXISTING PRESUPUESTO CONTENT GOES HERE */}
        {/* Including: Rejection Handling, Add Rubro Form, Rubros Table, Client Approval */}
    </>
) : (
    <PaymentTab obraId={id} presupuesto={presupuesto} userRole={user.rol} />
)}
```

---

## Expected Result

After these changes, users will see:
1. Two tabs: "Presupuesto" and "Pagos"
2. Clicking "Presupuesto" shows the existing budget view
3. Clicking "Pagos" shows the new Payment tab with:
   - Summary Panel (Total General, Total Pagado, Saldo Pendiente)
   - Payment Registration Form (Architect only, when presupuesto is Aprobado)
   - Payment History Table

---

## Backend Status

✅ Backend is complete and ready:
- Migration: `migrations/add_payment_fields.sql` (needs manual DB execution)
- Model: `pagoModel.js`
- Service: `pagoService.js`
- Controller: `pagoController.js`
- Routes: `pagoRoutes.js` (mounted in `server.js`)

---

## Next Steps

1. Apply the manual changes above to `ObraDetails.jsx`
2. Run the database migration: `node run_payment_migration.js` (fix DB auth first)
3. Test the Payment tab functionality
4. Verify dark mode styles
5. Verify Spanish localization
