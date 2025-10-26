# Permission System Guide

## Overview

The system now has role-based permissions where Admin can control exactly what each Staff member can do.

## Roles

### 1. **ADMIN** (Full Access)
- ✅ Everything - no restrictions
- ✅ Create/edit rentals
- ✅ Process returns
- ✅ Manage inventory quantities
- ✅ View all reports and stats
- ✅ Manage users and permissions

### 2. **STAFF** (Customizable Permissions)
Staff members have 4 permissions that can be enabled/disabled by Admin:

#### Permission 1: **Can Create Rentals**
- ✅ Enabled by default
- Allows staff to create new rental records
- Access to "New Rental" form

#### Permission 2: **Can Process Returns**
- ✅ Enabled by default
- Allows staff to process returns
- Can view return calculations and complete returns

#### Permission 3: **Can Manage Inventory** 
- ❌ Disabled by default (THIS IS KEY!)
- When disabled: Staff CANNOT edit mould quantities
- When enabled: Staff can edit inventory numbers
- **Recommended: Keep this OFF for most staff**

#### Permission 4: **Can View Reports**
- ✅ Enabled by default
- Allows staff to see dashboard statistics
- View revenue and rental reports

## How It Works

### For Admin:

1. **Go to Users page** (Admin only)
2. When creating/editing a STAFF user, you'll see:
   ```
   Staff Permissions
   ☑️ Can Create Rentals
   ☑️ Can Process Returns  
   ☐ Can Manage Inventory (Edit Quantities)
   ☑️ Can View Reports & Dashboard Stats
   ```
3. **Check/uncheck** boxes to grant permissions
4. **Save** the user

### For Staff:

- Staff will **only see features** they have permission for
- If "Can Manage Inventory" is unchecked:
  - ❌ No "Edit" button on Moulds page
  - ❌ Cannot change inventory quantities
  - ✅ Can still VIEW moulds and availability

## Default Settings

When you create a new Staff member:
- ✅ Can Create Rentals: **YES**
- ✅ Can Process Returns: **YES**
- ❌ Can Manage Inventory: **NO** (Protected!)
- ✅ Can View Reports: **YES**

## Security

- Permissions are checked on both:
  - **Frontend**: UI elements hidden based on permissions
  - **Backend**: API endpoints verify permissions
- Staff cannot bypass restrictions by accessing URLs directly
- Only Admin can modify user permissions

## Example Scenarios

### Scenario 1: Basic Staff Member
```
Role: STAFF
Permissions:
  ✅ Can Create Rentals
  ✅ Can Process Returns  
  ❌ Can Manage Inventory
  ✅ Can View Reports
```
**Result**: Can handle daily rental operations but cannot touch inventory numbers

### Scenario 2: Senior Staff / Supervisor
```
Role: STAFF
Permissions:
  ✅ Can Create Rentals
  ✅ Can Process Returns  
  ✅ Can Manage Inventory (Special access!)
  ✅ Can View Reports
```
**Result**: Can do everything except manage users

### Scenario 3: Limited Staff (Data Entry Only)
```
Role: STAFF
Permissions:
  ✅ Can Create Rentals
  ❌ Can Process Returns  
  ❌ Can Manage Inventory
  ❌ Can View Reports
```
**Result**: Can only add new rentals, nothing else

## Testing the System

1. **Login as Admin**
2. **Create a test staff account:**
   - Email: staff@test.com
   - Password: test123
   - Role: STAFF
   - Leave "Can Manage Inventory" UNCHECKED

3. **Logout and login as staff**
4. **Go to Moulds page**
   - ✅ You can VIEW all moulds
   - ❌ No "Edit" button visible
   - ❌ Cannot change quantities

5. **Try to create a rental**
   - ✅ Should work fine

6. **Try to process a return**
   - ✅ Should work fine

7. **Try to access Users page**
   - ❌ Should redirect (Admin only)

## Summary

✅ **Staff can:** Add rentals, process returns, view data  
❌ **Staff cannot:** Edit inventory, manage users  
🔧 **Admin can:** Everything + customize each staff member's permissions

This ensures inventory control while allowing staff to do their daily work!

