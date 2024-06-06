export class Product {
        type!: string;
        text!: string;
        Source!: string;
    }
      
    export class SelectedProduct {
        type!: string;
        text!: string;
        Source!: string;
      }

      export class Organization {
        orgId!: string;
        orgCode!: string;
        orgName!: string;
        contactPerson!: string;
        contactPersonEmail!: string;
        contactPersonPhone!: string;
        orgStatus!: string;
        invoiceEmail!: string;
        SMTPusername!: string;
        SMTPpassword!: string;
        SMTPurl!: string;
        SMTPport!: string;
  }

  export class UserRole {
    roleId!: string;
    roleName!: string;
    roleStatus!: string;
    OrgID!: string;
  }

  export class Module {
    moduleId!: string;
    moduleName!: string;
    displayName!: string;
    componentName!: string;
    permission?: boolean;
    accessRightsId?: string | null;
  }
