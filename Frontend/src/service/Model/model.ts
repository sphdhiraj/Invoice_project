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
    orgId!: string;
  }

  export class Module {
    moduleId!: string;
    moduleName!: string;
    displayName!: string;
    componentName!: string;
    permission?: boolean;
    accessRightsId?: string | null;
  }
  export class AccountModel{
    contactPerson!:string;
    contactPersonEmail!:string;
    contactPersonPhone!:string;
    invoiceEmail!:string;
    orgCode!:string;
    orgId!:string;
    orgName!:string;
    orgStatus!:string;
    smtpPassword!:string;
    smtpPort!:string;
    smtpURL!:string;
    smtpUsername!:string;
  }

  export class LoginDetail{
    UserEmail!: string
    Password!: string
}

  export class AccessRight {
    accessRightsId?: string;
    roleId!: string;
    orgId!: string;
    moduleId!: string;
    viewAccess!: boolean;
    addAccess!: boolean;
    editAccess!: boolean;
    deleteAccess!: boolean;
    printAccess!: boolean;
    cancelAccess!: boolean;
    approveAccess!:boolean;
    allAccess!: boolean;
    ModuleName!: string;
    DisplayName!:string
  }
