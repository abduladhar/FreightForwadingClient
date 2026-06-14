-- Freight Forwarding ERP seed data.
-- Run after EF Core migrations. Replace the password hash before production use.

DECLARE @TenantId uniqueidentifier = '11111111-1111-1111-1111-111111111111';
DECLARE @BranchId uniqueidentifier = '22222222-2222-2222-2222-222222222222';
DECLARE @SuperAdminId uniqueidentifier = '33333333-3333-3333-3333-333333333333';
DECLARE @SuperAdminPasswordHash nvarchar(512) = 'CHANGE_WITH_APPLICATION_PASSWORD_HASH';
DECLARE @Now datetimeoffset = SYSUTCDATETIME();

IF @SuperAdminPasswordHash = 'CHANGE_WITH_APPLICATION_PASSWORD_HASH'
BEGIN
    THROW 51000, 'Set @SuperAdminPasswordHash to an application-generated password hash before running seed-data.sql.', 1;
END

IF OBJECT_ID('master_currencies') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM master_currencies WHERE CurrencyCode = 'USD')
BEGIN
    INSERT INTO master_currencies (Id, CurrencyCode, CurrencyName, Symbol, DecimalPlaces, RoundingPrecision, FormatPattern, CountryRegion, IsActive, IsDeleted, CreatedDate)
    VALUES ('44444444-4444-4444-4444-444444444444', 'USD', 'US Dollar', '$', 2, 0.01, '$#,##0.00', 'United States', 1, 0, @Now);
END

IF OBJECT_ID('master_languages') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM master_languages WHERE LanguageCode = 'EN')
BEGIN
    INSERT INTO master_languages (Id, LanguageCode, CultureCode, DisplayName, NativeName, TextDirection, DateFormat, NumberFormat, IsActive, IsDefault, IsDeleted, CreatedDate)
    VALUES ('55555555-5555-5555-5555-555555555555', 'EN', 'en-US', 'English', 'English', 'LTR', 'MM/dd/yyyy', 'en-US', 1, 1, 0, @Now);
END

IF OBJECT_ID('platform_tenants') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM platform_tenants WHERE Id = @TenantId)
BEGIN
    INSERT INTO platform_tenants (Id, TenantCode, TenantName, LegalName, Email, Country, City, BaseCurrencyId, DefaultLanguageId, FinancialYearStartMonth, IsActive, IsDeleted, CreatedDate)
    VALUES (@TenantId, 'DEFAULT', 'Default Tenant', 'Default Freight ERP Tenant', 'admin@example.com', 'US', 'New York', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 1, 1, 0, @Now);
END

IF OBJECT_ID('platform_branches') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM platform_branches WHERE Id = @BranchId)
BEGIN
    INSERT INTO platform_branches (Id, TenantId, BranchCode, BranchName, Email, Country, City, IsActive, IsDeleted, CreatedDate)
    VALUES (@BranchId, @TenantId, 'HQ', 'Head Office', 'hq@example.com', 'US', 'New York', 1, 0, @Now);
END

IF OBJECT_ID('master_tenant_currencies') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM master_tenant_currencies WHERE TenantId = @TenantId AND CurrencyId = '44444444-4444-4444-4444-444444444444')
BEGIN
    INSERT INTO master_tenant_currencies (Id, TenantId, CurrencyId, IsBaseCurrency, IsEnabled, IsDeleted, CreatedDate)
    VALUES (NEWID(), @TenantId, '44444444-4444-4444-4444-444444444444', 1, 1, 0, @Now);
END

IF OBJECT_ID('master_tenant_languages') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM master_tenant_languages WHERE TenantId = @TenantId AND LanguageId = '55555555-5555-5555-5555-555555555555')
BEGIN
    INSERT INTO master_tenant_languages (Id, TenantId, LanguageId, IsDefault, IsEnabled, IsDeleted, CreatedDate)
    VALUES (NEWID(), @TenantId, '55555555-5555-5555-5555-555555555555', 1, 1, 0, @Now);
END

IF OBJECT_ID('iam_roles') IS NOT NULL
BEGIN
    INSERT INTO iam_roles (Id, TenantId, Name, NormalizedName, Description, IsSystemRole, IsDeleted, CreatedDate)
    SELECT NEWID(), @TenantId, v.Name, UPPER(v.Name), v.Description, 1, 0, @Now
    FROM (VALUES
        ('Super Admin', 'Full system access.'),
        ('Tenant Admin', 'Tenant-wide administration.'),
        ('Branch Admin', 'Branch administration.'),
        ('Manager', 'Operational and approval management.'),
        ('Sales User', 'Sales and quotation access.'),
        ('Warehouse User', 'Warehouse operations access.'),
        ('Operations User', 'Shipment operations access.'),
        ('Accounts User', 'Accounting and settlement access.'),
        ('Customer Service User', 'Customer service access.'),
        ('Auditor', 'Read-only audit and report access.'),
        ('Customer Portal User', 'Customer portal access.'),
        ('Agent Portal User', 'Agent portal access.')
    ) v(Name, Description)
    WHERE NOT EXISTS (SELECT 1 FROM iam_roles r WHERE r.TenantId = @TenantId AND r.NormalizedName = UPPER(v.Name));
END

IF OBJECT_ID('iam_users') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM iam_users WHERE TenantId = @TenantId AND Email = 'superadmin@example.com')
BEGIN
    INSERT INTO iam_users (Id, TenantId, BranchId, Email, UserName, FirstName, LastName, PasswordHash, IsActive, IsLocked, FailedLoginAttempts, IsDeleted, CreatedDate)
    VALUES (@SuperAdminId, @TenantId, @BranchId, 'superadmin@example.com', 'superadmin', 'Super', 'Admin', @SuperAdminPasswordHash, 1, 0, 0, 0, @Now);
END

IF OBJECT_ID('iam_user_roles') IS NOT NULL
AND OBJECT_ID('iam_roles') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM iam_user_roles WHERE TenantId = @TenantId AND UserId = @SuperAdminId)
BEGIN
    INSERT INTO iam_user_roles (Id, TenantId, UserId, RoleId, CreatedDate)
    SELECT NEWID(), @TenantId, @SuperAdminId, r.Id, @Now
    FROM iam_roles r
    WHERE r.TenantId = @TenantId AND r.NormalizedName = 'SUPER ADMIN';
END

IF OBJECT_ID('iam_role_permissions') IS NOT NULL
AND OBJECT_ID('iam_permissions') IS NOT NULL
AND OBJECT_ID('iam_roles') IS NOT NULL
BEGIN
    INSERT INTO iam_role_permissions (Id, TenantId, RoleId, PermissionId, CreatedDate)
    SELECT NEWID(), @TenantId, r.Id, p.Id, @Now
    FROM iam_roles r
    CROSS JOIN iam_permissions p
    WHERE r.TenantId = @TenantId
      AND r.NormalizedName = 'SUPER ADMIN'
      AND NOT EXISTS (
          SELECT 1 FROM iam_role_permissions rp
          WHERE rp.TenantId = @TenantId AND rp.RoleId = r.Id AND rp.PermissionId = p.Id);
END

IF OBJECT_ID('acc_account_groups') IS NOT NULL
BEGIN
    INSERT INTO acc_account_groups (Id, TenantId, GroupCode, GroupName, NormalBalance, IsSystem, IsActive, IsDeleted, CreatedDate)
    SELECT NEWID(), @TenantId, v.Code, v.Name, v.Balance, 1, 1, 0, @Now
    FROM (VALUES
        ('ASSETS','Assets','Debit'),
        ('LIABILITIES','Liabilities','Credit'),
        ('INCOME','Income','Credit'),
        ('EXPENSES','Expenses','Debit'),
        ('CAPITAL','Capital','Credit')
    ) v(Code, Name, Balance)
    WHERE NOT EXISTS (SELECT 1 FROM acc_account_groups g WHERE g.TenantId = @TenantId AND g.GroupCode = v.Code);
END

IF OBJECT_ID('acc_account_subgroups') IS NOT NULL
AND OBJECT_ID('acc_account_groups') IS NOT NULL
BEGIN
    INSERT INTO acc_account_subgroups (Id, TenantId, AccountGroupId, SubGroupCode, SubGroupName, IsSystem, IsActive, IsDeleted, CreatedDate)
    SELECT NEWID(), @TenantId, g.Id, v.Code, v.Name, 1, 1, 0, @Now
    FROM (VALUES
        ('ASSETS','CURRENT_ASSETS','Current Assets'),
        ('ASSETS','BANK_ACCOUNTS','Bank Accounts'),
        ('ASSETS','CASH_ACCOUNTS','Cash Accounts'),
        ('ASSETS','CUSTOMER_RECEIVABLES','Customer Receivables'),
        ('ASSETS','TAX_RECEIVABLE','Tax Receivable'),
        ('LIABILITIES','VENDOR_PAYABLES','Vendor Payables'),
        ('LIABILITIES','TAX_PAYABLE','Tax Payable'),
        ('INCOME','FREIGHT_INCOME','Freight Income'),
        ('INCOME','EXCHANGE_GAIN','Exchange Gain'),
        ('EXPENSES','FREIGHT_EXPENSE','Freight Expense'),
        ('EXPENSES','BANK_CHARGES','Bank Charges'),
        ('EXPENSES','EXCHANGE_LOSS','Exchange Loss'),
        ('CAPITAL','RETAINED_EARNINGS','Retained Earnings')
    ) v(GroupCode, Code, Name)
    JOIN acc_account_groups g ON g.TenantId = @TenantId AND g.GroupCode = v.GroupCode
    WHERE NOT EXISTS (SELECT 1 FROM acc_account_subgroups sg WHERE sg.TenantId = @TenantId AND sg.SubGroupCode = v.Code);
END

IF OBJECT_ID('acc_chart_of_accounts') IS NOT NULL
AND OBJECT_ID('acc_account_groups') IS NOT NULL
AND OBJECT_ID('acc_account_subgroups') IS NOT NULL
BEGIN
    INSERT INTO acc_chart_of_accounts (Id, TenantId, AccountCode, AccountName, AccountGroupId, AccountSubGroupId, IsControlAccount, AllowManualPosting, IsActive, IsDeleted, CreatedDate)
    SELECT NEWID(), @TenantId, v.Code, v.Name, g.Id, sg.Id, v.IsControl, v.AllowManual, 1, 0, @Now
    FROM (VALUES
        ('1100','Customer Receivables','ASSETS','CUSTOMER_RECEIVABLES',1,0),
        ('1110','Default Bank','ASSETS','BANK_ACCOUNTS',0,1),
        ('1120','Default Cash','ASSETS','CASH_ACCOUNTS',0,1),
        ('1130','Tax Receivable','ASSETS','TAX_RECEIVABLE',1,0),
        ('2100','Vendor Payables','LIABILITIES','VENDOR_PAYABLES',1,0),
        ('2130','Tax Payable','LIABILITIES','TAX_PAYABLE',1,0),
        ('4100','Freight Income','INCOME','FREIGHT_INCOME',0,0),
        ('4900','Exchange Gain','INCOME','EXCHANGE_GAIN',0,0),
        ('5100','Freight Expense','EXPENSES','FREIGHT_EXPENSE',0,0),
        ('5200','Bank Charges','EXPENSES','BANK_CHARGES',0,0),
        ('5900','Exchange Loss','EXPENSES','EXCHANGE_LOSS',0,0),
        ('3100','Retained Earnings','CAPITAL','RETAINED_EARNINGS',1,0)
    ) v(Code, Name, GroupCode, SubGroupCode, IsControl, AllowManual)
    JOIN acc_account_groups g ON g.TenantId = @TenantId AND g.GroupCode = v.GroupCode
    JOIN acc_account_subgroups sg ON sg.TenantId = @TenantId AND sg.SubGroupCode = v.SubGroupCode
    WHERE NOT EXISTS (SELECT 1 FROM acc_chart_of_accounts coa WHERE coa.TenantId = @TenantId AND coa.AccountCode = v.Code);
END

IF OBJECT_ID('acc_ledger_accounts') IS NOT NULL
AND OBJECT_ID('acc_chart_of_accounts') IS NOT NULL
BEGIN
    INSERT INTO acc_ledger_accounts (Id, TenantId, ChartOfAccountId, LedgerCode, LedgerName, CurrencyId, IsControlLedger, AllowManualPosting, IsActive, IsDeleted, CreatedDate)
    SELECT NEWID(), @TenantId, coa.Id, v.Code, v.Name, '44444444-4444-4444-4444-444444444444', v.IsControl, v.AllowManual, 1, 0, @Now
    FROM (VALUES
        ('1100','1100','Customer Receivables',1,0),
        ('1110','1110','Default Bank USD',0,1),
        ('1120','1120','Default Cash USD',0,1),
        ('1130','1130','Input Tax',1,0),
        ('2100','2100','Vendor Payables',1,0),
        ('2130','2130','Output Tax',1,0),
        ('4100','4100','Freight Income',0,0),
        ('4900','4900','Exchange Gain',0,0),
        ('5100','5100','Freight Expense',0,0),
        ('5200','5200','Bank Charges',0,0),
        ('5900','5900','Exchange Loss',0,0),
        ('3100','3100','Retained Earnings',1,0)
    ) v(AccountCode, Code, Name, IsControl, AllowManual)
    JOIN acc_chart_of_accounts coa ON coa.TenantId = @TenantId AND coa.AccountCode = v.AccountCode
    WHERE NOT EXISTS (SELECT 1 FROM acc_ledger_accounts la WHERE la.TenantId = @TenantId AND la.LedgerCode = v.Code);
END

IF OBJECT_ID('acc_tax_ledgers') IS NOT NULL
AND OBJECT_ID('acc_ledger_accounts') IS NOT NULL
BEGIN
    INSERT INTO acc_tax_ledgers (Id, TenantId, LedgerAccountId, TaxCode, TaxName, TaxRate, IsRecoverable, IsActive, IsDeleted, CreatedDate)
    SELECT NEWID(), @TenantId, la.Id, v.Code, v.Name, v.Rate, v.IsRecoverable, 1, 0, @Now
    FROM (VALUES
        ('OUTPUT_STD','Standard Output Tax',5.0000,0,'2130'),
        ('INPUT_STD','Standard Input Tax',5.0000,1,'1130'),
        ('ZERO','Zero Rated Tax',0.0000,0,'2130')
    ) v(Code, Name, Rate, IsRecoverable, LedgerCode)
    JOIN acc_ledger_accounts la ON la.TenantId = @TenantId AND la.LedgerCode = v.LedgerCode
    WHERE NOT EXISTS (SELECT 1 FROM acc_tax_ledgers t WHERE t.TenantId = @TenantId AND t.TaxCode = v.Code);
END

IF OBJECT_ID('acc_account_mapping_settings') IS NOT NULL
AND OBJECT_ID('acc_ledger_accounts') IS NOT NULL
BEGIN
    INSERT INTO acc_account_mapping_settings (Id, TenantId, MappingKey, MappingName, LedgerAccountId, SourceModule, IsActive, IsDeleted, CreatedDate)
    SELECT NEWID(), @TenantId, v.MappingKey, v.MappingName, la.Id, v.SourceModule, 1, 0, @Now
    FROM (VALUES
        ('Invoice.AccountsReceivable','Invoice Accounts Receivable','1100','Invoice'),
        ('Invoice.Revenue','Invoice Revenue','4100','Invoice'),
        ('Invoice.TaxPayable','Invoice Tax Payable','2130','Invoice'),
        ('VendorBill.AccountsPayable','Vendor Bill Accounts Payable','2100','VendorBill'),
        ('VendorBill.Cost','Vendor Bill Cost','5100','VendorBill'),
        ('VendorBill.TaxRecoverable','Vendor Bill Tax Recoverable','1130','VendorBill'),
        ('CustomerReceivable','Ledger Customer Receivable','1100','Invoice'),
        ('Income.Freight','Ledger Freight Income','4100','Invoice'),
        ('TaxPayable','Ledger Tax Payable','2130','Invoice'),
        ('Expense.Freight','Ledger Freight Expense','5100','VendorBill'),
        ('TaxReceivable','Ledger Tax Receivable','1130','VendorBill'),
        ('VendorPayable','Ledger Vendor Payable','2100','VendorBill'),
        ('Receipt.Bank','Receipt Bank','1110','Receipt'),
        ('Receipt.Cash','Receipt Cash','1120','Receipt'),
        ('Receipt.AccountsReceivable','Receipt Accounts Receivable','1100','Receipt'),
        ('Receipt.CustomerAdvance','Receipt Customer Advance','2100','Receipt'),
        ('Receipt.BankCharges','Receipt Bank Charges','5200','Receipt'),
        ('Receipt.ExchangeGain','Receipt Exchange Gain','4900','Receipt'),
        ('Receipt.ExchangeLoss','Receipt Exchange Loss','5900','Receipt'),
        ('Payment.Bank','Payment Bank','1110','Payment'),
        ('Payment.Cash','Payment Cash','1120','Payment'),
        ('Payment.AccountsPayable','Payment Accounts Payable','2100','Payment'),
        ('Payment.VendorAdvance','Payment Vendor Advance','1100','Payment'),
        ('Payment.BankCharges','Payment Bank Charges','5200','Payment'),
        ('Payment.ExchangeGain','Payment Exchange Gain','4900','Payment'),
        ('Payment.ExchangeLoss','Payment Exchange Loss','5900','Payment'),
        ('Bank','Ledger Bank','1110','Receipt'),
        ('Cash','Ledger Cash','1120','Receipt'),
        ('CustomerAdvance','Ledger Customer Advance','2100','Receipt'),
        ('CustomerReceivable','Ledger Receipt Receivable','1100','Receipt'),
        ('BankCharges','Ledger Receipt Bank Charges','5200','Receipt'),
        ('ExchangeGain','Ledger Receipt Exchange Gain','4900','Receipt'),
        ('ExchangeLoss','Ledger Receipt Exchange Loss','5900','Receipt'),
        ('Bank','Ledger Payment Bank','1110','Payment'),
        ('Cash','Ledger Payment Cash','1120','Payment'),
        ('VendorAdvance','Ledger Vendor Advance','1100','Payment'),
        ('VendorPayable','Ledger Payment Payable','2100','Payment'),
        ('BankCharges','Ledger Payment Bank Charges','5200','Payment'),
        ('ExchangeGain','Ledger Payment Exchange Gain','4900','Payment'),
        ('ExchangeLoss','Ledger Payment Exchange Loss','5900','Payment'),
        ('ExchangeGain','Exchange Gain','4900','ExchangeGainLoss'),
        ('ExchangeGainContra','Exchange Gain Contra','1100','ExchangeGainLoss'),
        ('ExchangeLoss','Exchange Loss','5900','ExchangeGainLoss'),
        ('ExchangeLossContra','Exchange Loss Contra','2100','ExchangeGainLoss'),
        ('TaxPayableContra','Tax Payable Contra','1130','Tax'),
        ('TaxPayable','Output Tax Payable','2130','Tax'),
        ('TaxReceivable','Input Tax Receivable','1130','Tax'),
        ('TaxReceivableContra','Tax Receivable Contra','2130','Tax'),
        ('SalaryExpense','Salary Expense','5100','Salary'),
        ('AccrualPayable','Salary Accrual Payable','2100','Salary'),
        ('IncentiveExpense','Incentive Expense','5100','Incentive'),
        ('AccrualPayable','Incentive Accrual Payable','2100','Incentive'),
        ('AgentCommissionExpense','Agent Commission Expense','5100','AgentCommission'),
        ('AccrualPayable','Agent Commission Accrual Payable','2100','AgentCommission'),
        ('SourceBank','Contra Source Bank','1110','ContraVoucher'),
        ('DestinationBank','Contra Destination Bank','1110','ContraVoucher')
    ) v(MappingKey, MappingName, LedgerCode, SourceModule)
    JOIN acc_ledger_accounts la ON la.TenantId = @TenantId AND la.LedgerCode = v.LedgerCode
    WHERE NOT EXISTS (SELECT 1 FROM acc_account_mapping_settings m WHERE m.TenantId = @TenantId AND m.MappingKey = v.MappingKey);
END

IF OBJECT_ID('acc_bank_accounts') IS NOT NULL
AND OBJECT_ID('acc_ledger_accounts') IS NOT NULL
BEGIN
    INSERT INTO acc_bank_accounts (Id, TenantId, LedgerAccountId, BankName, AccountNumber, CurrencyId, IsActive, IsDeleted, CreatedDate)
    SELECT NEWID(), @TenantId, la.Id, 'Default Bank', 'DEFAULT-USD', '44444444-4444-4444-4444-444444444444', 1, 0, @Now
    FROM acc_ledger_accounts la
    WHERE la.TenantId = @TenantId AND la.LedgerCode = '1110'
      AND NOT EXISTS (SELECT 1 FROM acc_bank_accounts b WHERE b.TenantId = @TenantId AND b.AccountNumber = 'DEFAULT-USD');
END

IF OBJECT_ID('acc_cash_accounts') IS NOT NULL
AND OBJECT_ID('acc_ledger_accounts') IS NOT NULL
BEGIN
    INSERT INTO acc_cash_accounts (Id, TenantId, LedgerAccountId, CashAccountName, CurrencyId, IsActive, IsDeleted, CreatedDate)
    SELECT NEWID(), @TenantId, la.Id, 'Default Cash USD', '44444444-4444-4444-4444-444444444444', 1, 0, @Now
    FROM acc_ledger_accounts la
    WHERE la.TenantId = @TenantId AND la.LedgerCode = '1120'
      AND NOT EXISTS (SELECT 1 FROM acc_cash_accounts c WHERE c.TenantId = @TenantId AND c.CashAccountName = 'Default Cash USD');
END

-- Default permissions are generated by EF Core HasData from IdentityDefaults.Modules x IdentityDefaults.Actions.
-- Default charge heads are represented by rate, quotation, invoice, and bill line charge names until a dedicated charge-head master is introduced.
-- Default numbering formats are documented in docs/deployment-guide.md and should be migrated into a numbering table when that module is added.

IF OBJECT_ID('audit_full_logs') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM audit_full_logs WHERE TenantId = @TenantId AND ModuleName = 'Deployment' AND ActionName = 'SeedDataApplied')
BEGIN
    INSERT INTO audit_full_logs (Id, TenantId, BranchId, UserId, UserName, UserRole, ModuleName, EntityName, RecordId, RecordNumber, ActionType, ActionName, ActionDescription, Status, CorrelationId, CreatedDate)
    VALUES (NEWID(), @TenantId, @BranchId, CONVERT(nvarchar(128), @SuperAdminId), 'seed-data.sql', 'Deployment', 'Deployment', 'SeedData', @TenantId, 'DEFAULT', 'Create', 'SeedDataApplied', 'Initial seed data applied for default tenant, branch, roles, permissions, currencies, language, accounting setup, tax setup, and mappings.', 'Success', 'seed-data', @Now);
END
