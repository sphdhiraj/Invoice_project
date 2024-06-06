package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte("InVoice")

type Organization struct {
	OrgID              primitive.ObjectID `json:"orgId,omitempty" bson:"_id,omitempty"`
	OrgCode            string             `json:"orgCode" bson:"orgCode"`
	OrgName            string             `json:"orgName" bson:"orgName"`
	ContactPerson      string             `json:"contactPerson" bson:"contactPerson"`
	ContactPersonEmail string             `json:"contactPersonEmail" bson:"contactPersonEmail"`
	ContactPersonPhone string             `json:"contactPersonPhone" bson:"contactPersonPhone"`
	OrgStatus          string             `json:"orgStatus" bson:"orgStatus"`
	InvoiceEmail       string             `json:"invoiceEmail" bson:"invoiceEmail"`
	SMTPUsername       string             `json:"smtpUsername" bson:"smtpUsername"`
	SMTPPassword       string             `json:"smtpPassword" bson:"smtpPassword"`
	SMTPURL            string             `json:"smtpURL" bson:"smtpURL"`
	SMTPPORT           string             `json:"smtpPort" bson:"smtpPort"`
}

type OrganizationUser struct {
	UserID         primitive.ObjectID `json:"userId,omitempty" bson:"_id,omitempty"`
	OrganizationID primitive.ObjectID `json:"organizationId" bson:"organizationId"`
	Name           string             `json:"name" bson:"name"`
	UserEmail      string             `json:"userEmail" bson:"userEmail"`
	UserPhone      string             `json:"userPhone" bson:"userPhone"`
	UserStatus     string             `json:"userStatus" bson:"userStatus"`
	Password       string             `json:"password" bson:"password"`
	UserRoleID     primitive.ObjectID `json:"userRoleId" bson:"userRoleId"`
}

type UserRole struct {
	RoleID     primitive.ObjectID `json:"roleId,omitempty" bson:"_id,omitempty"`
	RoleName   string             `json:"roleName" bson:"roleName"`
	RoleStatus string             `json:"roleStatus" bson:"roleStatus"`
	OrgID      primitive.ObjectID `json:"orgId" bson:"orgId"`
}

type OrgAccessRights struct {
	AccessRightsID primitive.ObjectID `json:"accessRightsId,omitempty" bson:"_id,omitempty"`
	OrgID          primitive.ObjectID `json:"orgId" bson:"orgId"`
	ModuleID       primitive.ObjectID `json:"moduleId" bson:"moduleId"`
	Permission     bool               `json:"permission" bson:"permission"`
}

type Module struct {
	ModuleID    primitive.ObjectID `json:"moduleId,omitempty" bson:"_id,omitempty"`
	ModuleName  string             `json:"moduleName" bson:"moduleName"`
	DisplayName string             `json:"displayName" bson:"displayName"`
	Component   string             `json:"component" bson:"component"`
	Action      string             `json:"action" bson:"action"`
}

type AccessRights struct {
	AccessRightsID primitive.ObjectID `json:"accessRightsId,omitempty" bson:"_id,omitempty"`
	RoleID         primitive.ObjectID `json:"roleId" bson:"roleId"`
	OrgID          primitive.ObjectID `json:"orgId" bson:"orgId"`
	ModuleID       primitive.ObjectID `json:"moduleId" bson:"moduleId"`
	ViewAccess     bool               `json:"viewAccess" bson:"viewAccess"`
	AddAccess      bool               `json:"addAccess" bson:"addAccess"`
	EditAccess     bool               `json:"editAccess" bson:"editAccess"`
	DeleteAccess   bool               `json:"deleteAccess" bson:"deleteAccess"`
	PrintAccess    bool               `json:"printAccess" bson:"printAccess"`
	CancelAccess   bool               `json:"cancelAccess" bson:"cancelAccess"`
	AllAccess      bool               `json:"allAccess" bson:"allAccess"`
}

type LoginRequest struct {
	UserEmail string `json:"userEmail" binding:"required"`
	Password  string `json:"password" binding:"required"`
}

type OrganizationUserResponse struct {
	UserID         primitive.ObjectID `json:"userId,omitempty" bson:"_id,omitempty"`
	OrganizationID primitive.ObjectID `json:"organizationId" bson:"organizationId"`
	Name           string             `json:"name" bson:"name"`
	UserEmail      string             `json:"userEmail" bson:"userEmail"`
	UserPhone      string             `json:"userPhone" bson:"userPhone"`
	UserStatus     string             `json:"userStatus" bson:"userStatus"`
	UserRoleID     primitive.ObjectID `json:"userRoleId" bson:"userRoleId"`
	OrgName        string             `json:"orgName"`
	OrgCode        string             `json:"orgCode"`
}

type manager struct {
	connection *mongo.Client
	ctx        context.Context
	cancel     context.CancelFunc
}

var Mgr Manager

type Manager interface {
	//organisation
	Insert(interface{}) (primitive.ObjectID, error)
	GetAll() ([]Organization, error)
	SetOrganizationStatusToInactive(id primitive.ObjectID) error
	GetOrganizationByID(id primitive.ObjectID) (Organization, error)
	UpdateData(Organization) error

	//user
	InsertOrganizationUser(interface{}) error
	GetAllOrganizationUsers() ([]OrganizationUser, error)
	SetUserStatusToInactive(id primitive.ObjectID) error
	GetUserByID(id primitive.ObjectID) (OrganizationUser, error)
	UpdateOrganizationUser(OrganizationUser) error

	//user role
	// InsertUserRole(interface{}) error
	InsertUserRole(UserRole) (primitive.ObjectID, error)
	GetAllUserRoles() ([]UserRole, error)
	SetRoleStatusToInactive(id primitive.ObjectID) error
	GetUserRoleByID(id primitive.ObjectID) (UserRole, error)
	UpdateUserRole(UserRole) error
	createAccessRightsForRole(orgID, roleID primitive.ObjectID) error

	//org accessrights
	InsertOrgAccessRights([]interface{}) error
	GetAllOrgAccessRights() ([]OrgAccessRights, error)
	DeleteOrgAccessRights(primitive.ObjectID) error
	UpdateOrgAccessRights([]OrgAccessRights) error

	//modules
	InsertModule(interface{}) error
	GetAllModules() ([]Module, error)
	DeleteModule(primitive.ObjectID) error
	UpdateModule(Module) error

	//AccessRights
	InsertAccessRights([]interface{}) error
	GetAllAccessRights() ([]AccessRights, error)
	UpdateAccessRights([]AccessRights) error

	//method other apis
	GetUsersByOrganization(objectID primitive.ObjectID) ([]OrganizationUserResponse, error)

	GetOrgModuleListByOrgID(orgID primitive.ObjectID) ([]Module, error)

	LoginUser(email, password string) (OrganizationUser, error)

	GetOrganizationDetailsByID(id primitive.ObjectID) (Organization, error)

	GetAccessRightsByRoleIDandOrgId(roleID, orgID primitive.ObjectID) ([]AccessRights, error)

	GetModuleByID(id primitive.ObjectID) (Module, error)

	GetModuleOrgAccessRightsByOrgID(orgID primitive.ObjectID) ([]gin.H, error)

	GetAccessRightsByOrgIDAndRoleID(roleID, orgID primitive.ObjectID) ([]gin.H, error)

	GetOrgAccessRightsByOrgID(orgID primitive.ObjectID) ([]OrgAccessRights, error)
}

func connectDb() {
	// uri := "mongodb://localhost:27017"
	uri := "mongodb+srv://Root:Root@invoicedatabase.gicc9wm.mongodb.net/"
	client, err := mongo.NewClient(options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatalf("Failed to create MongoDB client: %v", err)
	}
	// ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	ctx := context.Background()
	err = client.Connect(ctx)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
	}
	fmt.Println("Connected!!!")
	//Mgr = &manager{connection: client, ctx: ctx, cancel: cancel}
	Mgr = &manager{connection: client, ctx: ctx, cancel: func() {}}
}

func close(client *mongo.Client, ctx context.Context, cancel context.CancelFunc) {
	defer cancel()
	defer func() {
		if err := client.Disconnect(ctx); err != nil {
			panic(err)
		}
	}()
}

func init() {
	connectDb()
}

// CORS Middleware
func CORS(c *gin.Context) {

	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("Access-Control-Allow-Methods", "*")
	c.Header("Access-Control-Allow-Headers", "*")
	c.Header("Content-Type", "application/json")

	if c.Request.Method != "OPTIONS" {

		c.Next()

	} else {

		c.AbortWithStatus(http.StatusOK)
	}
}

func main() {
	r := gin.Default()
	r.Use(CORS)
	r.GET("/organizations", getAllOrganizations)
	r.POST("/organizations", insertOrganization)
	r.DELETE("/organizations/:id", deleteOrganization)
	r.GET("/organizationbyid/:id", getOrganizationByID)
	r.PUT("/organizations", updateOrganization)

	r.GET("/organization-users", getAllOrganizationUsers)
	r.POST("/organization-users", insertOrganizationUser)
	r.DELETE("/organization-users/:id", deleteOrganizationUser)
	r.GET("/users/:id", getUserByID)
	r.PUT("/organization-users", updateOrganizationUser)

	r.GET("/user-roles", getAllUserRoles)
	r.POST("/user-roles", insertUserRole)
	r.DELETE("/user-roles/:id", deleteUserRole)
	r.GET("/user-roles/:id", getUserRoleByID)
	r.PUT("/user-roles", updateUserRole)

	r.POST("/org-access-rights", insertOrgAccessRights)
	r.GET("/org-access-rights", getAllOrgAccessRights)
	r.DELETE("/org-access-rights/:id", deleteOrgAccessRights)
	r.POST("/modules", insertModule)
	r.GET("/modules", getAllModules)
	r.DELETE("/modules/:id", deleteModule)
	r.PUT("/modules", updateModule)

	r.POST("/access-rights", insertAccessRights)
	r.GET("/access-rights", getAllAccessRights)

	r.GET("/organizations/:id", getUsersByOrganization)

	r.GET("/organizationssss/:id", getOrgModuleListByOrgID)

	r.POST("/login", loginUser)
	r.GET("/modules-access-rights/:orgid", getModuleOrgAccessRightsByOrgID)

	r.GET("/access-rights/:orgId/:roleId", getAccessRightsByOrgIDAndRoleID)

	r.Run(":9090")

}

func getAccessRightsByOrgIDAndRoleID(c *gin.Context) {
	orgIDHex := c.Param("orgId")
	roleIDHex := c.Param("roleId")

	orgID, err := primitive.ObjectIDFromHex(orgIDHex)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Org ID"})
		return
	}

	roleID, err := primitive.ObjectIDFromHex(roleIDHex)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Role ID"})
		return
	}

	accessRights, err := Mgr.GetAccessRightsByOrgIDAndRoleID(roleID, orgID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"accessRights": accessRights})
}

func (mgr *manager) GetAccessRightsByOrgIDAndRoleID(roleID, orgID primitive.ObjectID) ([]gin.H, error) {
	var results []gin.H

	// Step 1: Find AccessRights with the given RoleID and OrgID
	accessRightsCollection := mgr.connection.Database("Invoicedatabase").Collection("accessRights")
	filter := bson.M{"roleId": roleID, "orgId": orgID}
	cur, err := accessRightsCollection.Find(mgr.ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cur.Close(mgr.ctx)

	var accessRights []AccessRights
	for cur.Next(mgr.ctx) {
		var accessRight AccessRights
		if err := cur.Decode(&accessRight); err != nil {
			return nil, err
		}
		accessRights = append(accessRights, accessRight)
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}

	// Step 2: Validate each ModuleID in the accessRights with the orgAccessRights collection
	orgAccessRightsCollection := mgr.connection.Database("Invoicedatabase").Collection("orgAccessRights")
	moduleCollection := mgr.connection.Database("Invoicedatabase").Collection("modules")
	for _, accessRight := range accessRights {
		var orgAccessRight OrgAccessRights
		err := orgAccessRightsCollection.FindOne(mgr.ctx, bson.M{"moduleId": accessRight.ModuleID, "orgId": accessRight.OrgID, "permission": true}).Decode(&orgAccessRight)
		if err != nil {
			continue // skip if no matching permission is found
		}

		var module Module
		err = moduleCollection.FindOne(mgr.ctx, bson.M{"_id": accessRight.ModuleID}).Decode(&module)
		if err != nil {
			continue // skip if module not found
		}

		results = append(results, gin.H{
			"accessRightId": accessRight.AccessRightsID.Hex(),
			"roleId":        accessRight.RoleID.Hex(),
			"orgId":         accessRight.OrgID.Hex(),
			"moduleId":      accessRight.ModuleID.Hex(),
			"viewAccess":    accessRight.ViewAccess,
			"addAccess":     accessRight.AddAccess,
			"editAccess":    accessRight.EditAccess,
			"deleteAccess":  accessRight.DeleteAccess,
			"printAccess":   accessRight.PrintAccess,
			"cancelAccess":  accessRight.CancelAccess,
			"allAccess":     accessRight.AllAccess,
			"ModuleName":    module.ModuleName,
		})
	}

	return results, nil
}

// Handler function
func getModuleOrgAccessRightsByOrgID(c *gin.Context) {
	id := c.Param("orgid")
	orgID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid organization ID"})
		return
	}

	data, err := Mgr.GetModuleOrgAccessRightsByOrgID(orgID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": data})
}

func (mgr *manager) GetModuleOrgAccessRightsByOrgID(orgID primitive.ObjectID) ([]gin.H, error) {
	var accessRights []OrgAccessRights
	accessRightsCollection := mgr.connection.Database("Invoicedatabase").Collection("orgAccessRights")
	filter := bson.M{"orgId": orgID}

	cur, err := accessRightsCollection.Find(mgr.ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cur.Close(mgr.ctx)

	for cur.Next(mgr.ctx) {
		var ar OrgAccessRights
		err := cur.Decode(&ar)
		if err != nil {
			return nil, err
		}
		accessRights = append(accessRights, ar)
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}

	var results []gin.H
	moduleCollection := mgr.connection.Database("Invoicedatabase").Collection("modules")

	for _, ar := range accessRights {
		var module Module
		moduleFilter := bson.M{"_id": ar.ModuleID}
		err := moduleCollection.FindOne(mgr.ctx, moduleFilter).Decode(&module)
		if err != nil {
			return nil, err
		}

		result := gin.H{
			"accessRightsId": ar.AccessRightsID.Hex(),
			"moduleName":     module.ModuleName,
			"displayName":    module.DisplayName,
			"orgId":          ar.OrgID.Hex(),
			"moduleId":       ar.ModuleID.Hex(),
			"permission":     ar.Permission,
		}
		results = append(results, result)
	}
	return results, nil
}

func loginUser(c *gin.Context) {
	var loginReq LoginRequest
	if err := c.ShouldBindJSON(&loginReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := Mgr.LoginUser(loginReq.UserEmail, loginReq.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	// Generate JWT token
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := jwt.MapClaims{
		"userId":    user.UserID.Hex(),
		"userEmail": user.UserEmail,
		"exp":       expirationTime.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate token"})
		return
	}

	// Fetch organization details
	organization, err := Mgr.GetOrganizationDetailsByID(user.OrganizationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch organization details"})
		return
	}

	// Fetch access rights for user's role and organization
	accessRights, err := Mgr.GetAccessRightsByRoleIDandOrgId(user.UserRoleID, user.OrganizationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch access rights"})
		return
	}

	// Fetch organization access rights
	orgAccessRights, err := Mgr.GetOrgAccessRightsByOrgID(user.OrganizationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch organization access rights"})
		return
	}

	// Fetch module details for each access right and construct the response
	var accessRightsResponse []gin.H
	for _, ar := range accessRights {
		module, err := Mgr.GetModuleByID(ar.ModuleID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch module details"})
			return
		}
		arResponse := gin.H{
			"accessRightsId": ar.AccessRightsID.Hex(),
			"roleId":         ar.RoleID.Hex(),
			"orgId":          ar.OrgID.Hex(),
			"moduleId":       ar.ModuleID.Hex(),
			"moduleName":     module.ModuleName,
			"displayName":    module.DisplayName,
			"viewAccess":     ar.ViewAccess,
			"addAccess":      ar.AddAccess,
			"editAccess":     ar.EditAccess,
			"deleteAccess":   ar.DeleteAccess,
			"printAccess":    ar.PrintAccess,
			"cancelAccess":   ar.CancelAccess,
			"allAccess":      ar.AllAccess,
		}
		accessRightsResponse = append(accessRightsResponse, arResponse)
	}

	var orgAccessRightsResponse []gin.H
	for _, oar := range orgAccessRights {
		orgAccessRightsResponse = append(orgAccessRightsResponse, gin.H{
			"orgAccessRightsId": oar.AccessRightsID.Hex(),
			"orgId":             oar.OrgID.Hex(),
			"moduleId":          oar.ModuleID.Hex(),
			"permission":        oar.Permission,
		})
	}

	// Construct the response
	response := gin.H{
		"token": tokenString,
		"user": gin.H{
			"name":       user.Name,
			"roleName":   user.UserRoleID.Hex(),
			"userEmail":  user.UserEmail,
			"userId":     user.UserID.Hex(),
			"userPhone":  user.UserPhone,
			"userRoleId": user.UserRoleID.Hex(),
			"userStatus": user.UserStatus,
		},
		"Organizations": gin.H{
			"orgId":              organization.OrgID,
			"orgCode":            organization.OrgCode,
			"orgName":            organization.OrgName,
			"contactPerson":      organization.ContactPerson,
			"contactPersonEmail": organization.ContactPersonEmail,
			"contactPersonPhone": organization.ContactPersonPhone,
			"orgStatus":          organization.OrgStatus,
			"invoiceEmail":       organization.InvoiceEmail,
			"smtpPassword":       organization.SMTPPassword,
			"smtpPort":           organization.SMTPPORT,
			"smtpURL":            organization.SMTPURL,
			"smtpUsername":       organization.SMTPUsername,
		},
		"AccessRights":    accessRightsResponse,
		"OrgAccessRights": orgAccessRightsResponse,
	}

	// Send the response
	c.JSON(http.StatusOK, response)
}

func (mgr *manager) GetModuleByID(id primitive.ObjectID) (Module, error) {
	var module Module
	moduleCollection := mgr.connection.Database("Invoicedatabase").Collection("modules")
	filter := bson.M{"_id": id}
	err := moduleCollection.FindOne(mgr.ctx, filter).Decode(&module)
	if err != nil {
		return Module{}, err
	}
	return module, nil
}

func (mgr *manager) LoginUser(email, password string) (OrganizationUser, error) {
	var user OrganizationUser
	userCollection := mgr.connection.Database("Invoicedatabase").Collection("organizationUsers")
	filter := bson.M{"userEmail": email}
	err := userCollection.FindOne(context.TODO(), filter).Decode(&user)
	if err != nil {
		return OrganizationUser{}, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return OrganizationUser{}, fmt.Errorf("invalid email or password")
	}

	return user, nil
}

func (mgr *manager) GetOrganizationDetailsByID(id primitive.ObjectID) (Organization, error) {
	var organization Organization
	organizationCollection := mgr.connection.Database("Invoicedatabase").Collection("organizations")
	filter := bson.M{"_id": id}
	err := organizationCollection.FindOne(mgr.ctx, filter).Decode(&organization)
	if err != nil {
		return Organization{}, err
	}
	return organization, nil
}

func (mgr *manager) GetAccessRightsByRoleIDandOrgId(roleID, orgID primitive.ObjectID) ([]AccessRights, error) {
	var accessRights []AccessRights
	accessRightsCollection := mgr.connection.Database("Invoicedatabase").Collection("accessRights")
	filter := bson.M{"roleId": roleID, "orgId": orgID} // Ensure the field names match the BSON tags in AccessRights struct

	cur, err := accessRightsCollection.Find(mgr.ctx, filter)
	if err != nil {
		fmt.Println("Error finding access rights:", err)
		return nil, err
	}
	defer cur.Close(mgr.ctx)

	for cur.Next(mgr.ctx) {
		var ar AccessRights
		err := cur.Decode(&ar)
		if err != nil {
			fmt.Println("Error decoding access rights:", err)
			return nil, err
		}
		accessRights = append(accessRights, ar)
	}
	if err := cur.Err(); err != nil {
		fmt.Println("Cursor error:", err)
		return nil, err
	}

	fmt.Println("Access rights fetched:", accessRights)
	return accessRights, nil
}

// now
func (mgr *manager) GetOrgAccessRightsByOrgID(orgID primitive.ObjectID) ([]OrgAccessRights, error) {
	var orgAccessRights []OrgAccessRights
	orgAccessRightsCollection := mgr.connection.Database("Invoicedatabase").Collection("orgAccessRights")

	filter := bson.M{
		"orgId": orgID,
	}

	cur, err := orgAccessRightsCollection.Find(mgr.ctx, filter)
	if err != nil {
		fmt.Println("Error finding organization access rights:", err)
		return nil, err
	}
	defer cur.Close(mgr.ctx)

	for cur.Next(mgr.ctx) {
		var oar OrgAccessRights
		err := cur.Decode(&oar)
		if err != nil {
			fmt.Println("Error decoding organization access rights:", err)
			return nil, err
		}
		orgAccessRights = append(orgAccessRights, oar)
	}
	if err := cur.Err(); err != nil {
		fmt.Println("Cursor error:", err)
		return nil, err
	}

	fmt.Println("Organization access rights fetched:", orgAccessRights)
	return orgAccessRights, nil
}

// /organisaton//
func insertOrganization(c *gin.Context) {
	var org Organization
	if err := c.BindJSON(&org); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if org.OrgID.IsZero() {
		// Insert a new organization
		orgID, err := Mgr.Insert(org)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		folderName := orgID.Hex()

		// Get the current working directory
		currentDir, err := os.Getwd()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get current directory"})
			return
		}

		// Move one level up from the current directory
		parentDir := filepath.Dir(currentDir)

		// Create the base folder path dynamically
		baseFolder := filepath.Join(parentDir, "Invoice_Folder")

		// Create the new folder path
		newFolderPath := filepath.Join(baseFolder, folderName)

		// Create the organization folder
		err = os.MkdirAll(newFolderPath, 0755)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create folder"})
			return
		}

		// Create additional subfolders within the organization folder
		subFolders := []string{"myemails", "Processing_done_file", "Watch_Folder", "Process_folder"}
		for _, folder := range subFolders {
			err := os.Mkdir(filepath.Join(newFolderPath, folder), 0755)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create subfolder: " + folder})
				return
			}
		}

		c.JSON(http.StatusOK, gin.H{"message": "Organization inserted", "orgId": orgID})
	} else {
		// Update existing organization
		if err := Mgr.UpdateData(org); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Organization updated"})
	}
}

func getAllOrganizations(c *gin.Context) {
	data, err := Mgr.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": data})
}

func deleteOrganization(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set the organization status to "Inactive"
	if err := Mgr.SetOrganizationStatusToInactive(objectID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Organization status set to Inactive"})
}

func getOrganizationByID(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid organization ID"})
		return
	}

	org, err := Mgr.GetOrganizationByID(objectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch organization"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"organization": org})
}

func updateOrganization(c *gin.Context) {
	var org Organization
	if err := c.BindJSON(&org); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := Mgr.UpdateData(org); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "updated success"})
}

//interface organisation

func (mgr *manager) Insert(data interface{}) (primitive.ObjectID, error) {
	// Insert the organization document
	orgCollection := mgr.connection.Database("Invoicedatabase").Collection("organizations")
	result, err := orgCollection.InsertOne(context.TODO(), data)
	if err != nil {
		return primitive.NilObjectID, err
	}

	// Retrieve the orgID of the inserted document
	orgID := result.InsertedID.(primitive.ObjectID)
	fmt.Println("Inserted organization ID:", orgID)

	// Fetch all module IDs from the modules collection
	moduleCollection := mgr.connection.Database("Invoicedatabase").Collection("modules")
	cursor, err := moduleCollection.Find(context.TODO(), map[string]interface{}{})
	if err != nil {
		return primitive.NilObjectID, err
	}
	defer cursor.Close(context.TODO())

	var modules []primitive.ObjectID
	for cursor.Next(context.TODO()) {
		var module struct {
			ID primitive.ObjectID `bson:"_id"`
		}
		if err := cursor.Decode(&module); err != nil {
			return primitive.NilObjectID, err
		}
		modules = append(modules, module.ID)
	}

	if err := cursor.Err(); err != nil {
		return primitive.NilObjectID, err
	}

	// Prepare OrgAccessRights documents with each moduleID and permission set to false
	orgAccessRightsCollection := mgr.connection.Database("Invoicedatabase").Collection("orgAccessRights")
	var orgAccessRightsDocs []interface{}
	for _, moduleID := range modules {
		orgAccessRightsDoc := map[string]interface{}{
			"orgId":      orgID,
			"moduleId":   moduleID,
			"permission": false,
		}
		orgAccessRightsDocs = append(orgAccessRightsDocs, orgAccessRightsDoc)
	}

	// Insert OrgAccessRights documents
	_, err = orgAccessRightsCollection.InsertMany(context.TODO(), orgAccessRightsDocs)
	if err != nil {
		return primitive.NilObjectID, err
	}

	return orgID, nil
}

func (mgr *manager) GetAll() ([]Organization, error) {
	var data []Organization
	orgCollection := mgr.connection.Database("Invoicedatabase").Collection("organizations")
	cur, err := orgCollection.Find(context.TODO(), bson.M{}, options.Find())
	if err != nil {
		return nil, err
	}
	defer cur.Close(context.TODO())
	for cur.Next(context.TODO()) {
		var org Organization
		if err := cur.Decode(&org); err != nil {
			return nil, err
		}
		data = append(data, org)
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}
	return data, nil
}

func (mgr *manager) SetOrganizationStatusToInactive(id primitive.ObjectID) error {
	// Fetch the organization document
	var org Organization
	orgCollection := mgr.connection.Database("Invoicedatabase").Collection("organizations")
	err := orgCollection.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&org)
	if err != nil {
		return err
	}

	// Update the organization document to set orgStatus to "Inactive"
	filter := bson.M{"_id": id}
	update := bson.M{"$set": bson.M{"orgStatus": "Inactive"}}
	_, err = orgCollection.UpdateOne(context.TODO(), filter, update)
	return err
}

func (mgr *manager) GetOrganizationByID(id primitive.ObjectID) (Organization, error) {
	var org Organization
	orgCollection := mgr.connection.Database("Invoicedatabase").Collection("organizations")
	filter := bson.M{"_id": id}
	err := orgCollection.FindOne(context.TODO(), filter).Decode(&org)
	if err != nil {
		return Organization{}, err
	}
	return org, nil
}

func (mgr *manager) UpdateData(org Organization) error {
	orgCollection := mgr.connection.Database("Invoicedatabase").Collection("organizations")
	filter := bson.D{{"_id", org.OrgID}}
	update := bson.D{{"$set", org}}
	_, err := orgCollection.UpdateOne(context.TODO(), filter, update)
	return err
}

//method of organisation_user

func getAllOrganizationUsers(c *gin.Context) {
	data, err := Mgr.GetAllOrganizationUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": data})
}

func insertOrganizationUser(c *gin.Context) {
	var user OrganizationUser
	if err := c.BindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	user.Password = string(hashedPassword)

	if user.UserID.IsZero() {
		// Insert a new organization user
		if err := Mgr.InsertOrganizationUser(user); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Organization user inserted"})
	} else {
		// Update existing organization user
		if err := Mgr.UpdateOrganizationUser(user); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Organization user updated"})
	}
}

func deleteOrganizationUser(c *gin.Context) {
	id := c.Param("id")
	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set the user status to "Inactive"
	if err := Mgr.SetUserStatusToInactive(objectId); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User status set to Inactive"})
}

func getUserByID(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	user, err := Mgr.GetUserByID(objectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

func updateOrganizationUser(c *gin.Context) {
	var user OrganizationUser
	if err := c.BindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := Mgr.UpdateOrganizationUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User updated"})
}

//interface organisation_user

func (mgr *manager) InsertOrganizationUser(data interface{}) error {
	orgUserCollection := mgr.connection.Database("Invoicedatabase").Collection("organizationUsers")
	result, err := orgUserCollection.InsertOne(context.TODO(), data)
	if err != nil {
		return err
	}
	fmt.Println(result.InsertedID)
	return nil
}

func (mgr *manager) GetAllOrganizationUsers() ([]OrganizationUser, error) {
	var data []OrganizationUser
	orgUserCollection := mgr.connection.Database("Invoicedatabase").Collection("organizationUsers")
	cur, err := orgUserCollection.Find(context.TODO(), bson.M{}, options.Find())
	if err != nil {
		return nil, err
	}
	defer cur.Close(context.TODO())
	for cur.Next(context.TODO()) {
		var orgUser OrganizationUser
		if err := cur.Decode(&orgUser); err != nil {
			return nil, err
		}
		data = append(data, orgUser)
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}
	return data, nil
}
func (mgr *manager) SetUserStatusToInactive(id primitive.ObjectID) error {
	// Fetch the user document
	var user OrganizationUser
	userCollection := mgr.connection.Database("Invoicedatabase").Collection("organizationUsers")
	err := userCollection.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&user)
	if err != nil {
		return err
	}

	// Update the user document to set userStatus to "Inactive"
	filter := bson.M{"_id": id}
	update := bson.M{"$set": bson.M{"userStatus": "Inactive"}}
	_, err = userCollection.UpdateOne(context.TODO(), filter, update)
	return err
}
func (mgr *manager) GetUserByID(id primitive.ObjectID) (OrganizationUser, error) {
	var user OrganizationUser
	userCollection := mgr.connection.Database("Invoicedatabase").Collection("organizationUsers")
	filter := bson.M{"_id": id}
	err := userCollection.FindOne(context.TODO(), filter).Decode(&user)
	if err != nil {
		return OrganizationUser{}, err
	}
	return user, nil
}

func (mgr *manager) UpdateOrganizationUser(orgUser OrganizationUser) error {
	orgUserCollection := mgr.connection.Database("Invoicedatabase").Collection("organizationUsers")
	filter := bson.D{{"_id", orgUser.UserID}}
	update := bson.D{{"$set", orgUser}}
	_, err := orgUserCollection.UpdateOne(context.TODO(), filter, update)
	return err
}

//userrole

func insertUserRole(c *gin.Context) {
	var role UserRole
	if err := c.BindJSON(&role); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if role.RoleID.IsZero() {
		// Insert a new user role
		roleID, err := Mgr.InsertUserRole(role)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Fetch the OrgID from the newly inserted role and validate
		if err := Mgr.createAccessRightsForRole(role.OrgID, roleID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "User role inserted"})
	} else {
		// Update existing user role
		if err := Mgr.UpdateUserRole(role); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "User role updated"})
	}
}

func (mgr *manager) InsertUserRole(data UserRole) (primitive.ObjectID, error) {
	roleCollection := mgr.connection.Database("Invoicedatabase").Collection("userRoles")
	result, err := roleCollection.InsertOne(mgr.ctx, data)
	if err != nil {
		return primitive.NilObjectID, err
	}

	// After inserting the role, return the new role ID
	roleID := result.InsertedID.(primitive.ObjectID)

	fmt.Println("Inserted role ID:", roleID)
	return roleID, nil
}

func (mgr *manager) createAccessRightsForRole(orgID, roleID primitive.ObjectID) error {
	organizationCollection := mgr.connection.Database("Invoicedatabase").Collection("organizations")
	modulesCollection := mgr.connection.Database("Invoicedatabase").Collection("modules")
	accessRightsCollection := mgr.connection.Database("Invoicedatabase").Collection("accessRights")
	userRolesCollection := mgr.connection.Database("Invoicedatabase").Collection("userRoles")

	// Check if the OrgID exists in the organizations collection
	orgFilter := bson.M{"_id": orgID}
	orgCount, err := organizationCollection.CountDocuments(mgr.ctx, orgFilter)
	if err != nil {
		return fmt.Errorf("failed to check organization existence: %v", err)
	}
	if orgCount == 0 {
		return fmt.Errorf("organization with ID %s does not exist", orgID.Hex())
	}

	// Fetch all ModuleID from modules collection
	modulesCursor, err := modulesCollection.Find(mgr.ctx, bson.M{})
	if err != nil {
		return fmt.Errorf("failed to fetch modules: %v", err)
	}
	defer modulesCursor.Close(mgr.ctx)

	var modules []primitive.ObjectID
	for modulesCursor.Next(mgr.ctx) {
		var module struct {
			ID primitive.ObjectID `bson:"_id"`
		}
		if err := modulesCursor.Decode(&module); err != nil {
			return fmt.Errorf("failed to decode module: %v", err)
		}
		modules = append(modules, module.ID)
	}
	if err := modulesCursor.Err(); err != nil {
		return fmt.Errorf("cursor error: %v", err)
	}

	// Get the role name for the given roleID
	var role struct {
		RoleName string `bson:"roleName"`
	}
	err = userRolesCollection.FindOne(mgr.ctx, bson.M{"_id": roleID}).Decode(&role)
	if err != nil {
		return fmt.Errorf("failed to fetch role name: %v", err)
	}

	// Convert the role name to lowercase for case-insensitive comparison
	roleNameLower := strings.ToLower(role.RoleName)

	// Create entries in the accessRights collection
	var accessRightsDocs []interface{}
	for _, moduleID := range modules {
		accessRightsDoc := bson.M{
			"roleId":   roleID,
			"orgId":    orgID,
			"moduleId": moduleID,
		}

		if roleNameLower == "admin" {
			accessRightsDoc["viewAccess"] = true
			accessRightsDoc["addAccess"] = true
			accessRightsDoc["editAccess"] = true
			accessRightsDoc["deleteAccess"] = true
			accessRightsDoc["printAccess"] = true
			accessRightsDoc["cancelAccess"] = true
			accessRightsDoc["allAccess"] = true
		} else {
			accessRightsDoc["viewAccess"] = false
			accessRightsDoc["addAccess"] = false
			accessRightsDoc["editAccess"] = false
			accessRightsDoc["deleteAccess"] = false
			accessRightsDoc["printAccess"] = false
			accessRightsDoc["cancelAccess"] = false
			accessRightsDoc["allAccess"] = false
		}

		accessRightsDocs = append(accessRightsDocs, accessRightsDoc)
	}

	_, err = accessRightsCollection.InsertMany(mgr.ctx, accessRightsDocs)
	if err != nil {
		return fmt.Errorf("failed to insert access rights: %v", err)
	}

	return nil
}

func getAllUserRoles(c *gin.Context) {
	data, err := Mgr.GetAllUserRoles()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": data})
}

func deleteUserRole(c *gin.Context) {
	id := c.Param("id")
	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set the role status to "Inactive"
	if err := Mgr.SetRoleStatusToInactive(objectId); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User role status set to Inactive"})
}

func getUserRoleByID(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user role ID"})
		return
	}

	role, err := Mgr.GetUserRoleByID(objectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user role"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"userRole": role})
}

func updateUserRole(c *gin.Context) {
	var role UserRole
	if err := c.BindJSON(&role); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := Mgr.UpdateUserRole(role); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User role updated"})
}

//interface userrole

func (mgr *manager) GetAllUserRoles() ([]UserRole, error) {
	var data []UserRole
	roleCollection := mgr.connection.Database("Invoicedatabase").Collection("userRoles")
	cur, err := roleCollection.Find(context.TODO(), bson.M{}, options.Find())
	if err != nil {
		return nil, err
	}
	defer cur.Close(context.TODO())
	for cur.Next(context.TODO()) {
		var role UserRole
		if err := cur.Decode(&role); err != nil {
			return nil, err
		}
		data = append(data, role)
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}
	return data, nil
}
func (mgr *manager) SetRoleStatusToInactive(id primitive.ObjectID) error {
	// Fetch the role document
	var role UserRole
	roleCollection := mgr.connection.Database("Invoicedatabase").Collection("userRoles")
	err := roleCollection.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&role)
	if err != nil {
		return err
	}

	// Update the role document to set RoleStatus to "Inactive"
	filter := bson.M{"_id": id}
	update := bson.M{"$set": bson.M{"roleStatus": "Inactive"}}
	_, err = roleCollection.UpdateOne(context.TODO(), filter, update)
	return err
}

func (mgr *manager) GetUserRoleByID(id primitive.ObjectID) (UserRole, error) {
	var role UserRole
	roleCollection := mgr.connection.Database("Invoicedatabase").Collection("userRoles")
	filter := bson.M{"_id": id}
	err := roleCollection.FindOne(context.TODO(), filter).Decode(&role)
	if err != nil {
		return UserRole{}, err
	}
	return role, nil
}

func (mgr *manager) UpdateUserRole(role UserRole) error {
	roleCollection := mgr.connection.Database("Invoicedatabase").Collection("userRoles")
	filter := bson.D{{"_id", role.RoleID}}
	update := bson.D{{"$set", role}}
	_, err := roleCollection.UpdateOne(context.TODO(), filter, update)
	return err
}

//organisation accessrights

func insertOrgAccessRights(c *gin.Context) {
	var rights []OrgAccessRights
	if err := c.BindJSON(&rights); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var newRights []interface{}
	var existingRights []OrgAccessRights

	for _, right := range rights {
		if right.AccessRightsID.IsZero() {
			newRights = append(newRights, right)
		} else {
			existingRights = append(existingRights, right)
		}
	}

	if len(newRights) > 0 {
		if err := Mgr.InsertOrgAccessRights(newRights); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	if len(existingRights) > 0 {
		if err := Mgr.UpdateOrgAccessRights(existingRights); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Organization access rights processed"})
}

func getAllOrgAccessRights(c *gin.Context) {
	data, err := Mgr.GetAllOrgAccessRights()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": data})
}

func deleteOrgAccessRights(c *gin.Context) {
	id := c.Param("id")
	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := Mgr.DeleteOrgAccessRights(objectId); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "OrgAccessRights deleted"})
}

//interface orgnisation accesrights

func (mgr *manager) InsertOrgAccessRights(data []interface{}) error {
	collection := mgr.connection.Database("Invoicedatabase").Collection("orgAccessRights")
	_, err := collection.InsertMany(context.TODO(), data)

	if err != nil {
		return err
	}
	return nil
}

func (mgr *manager) UpdateOrgAccessRights(orgAccessRights []OrgAccessRights) error {
	collection := mgr.connection.Database("Invoicedatabase").Collection("orgAccessRights")
	var models []mongo.WriteModel

	for _, right := range orgAccessRights {
		filter := bson.D{{"_id", right.AccessRightsID}}
		update := bson.D{{"$set", right}}
		model := mongo.NewUpdateOneModel().SetFilter(filter).SetUpdate(update)
		models = append(models, model)
	}

	bulkOption := options.BulkWrite().SetOrdered(false)
	_, err := collection.BulkWrite(context.TODO(), models, bulkOption)
	return err
}

func (mgr *manager) GetAllOrgAccessRights() ([]OrgAccessRights, error) {
	var data []OrgAccessRights
	collection := mgr.connection.Database("Invoicedatabase").Collection("orgAccessRights")
	cur, err := collection.Find(context.TODO(), bson.M{}, options.Find())
	if err != nil {
		return nil, err
	}
	defer cur.Close(context.TODO())
	for cur.Next(context.TODO()) {
		var orgAccessRights OrgAccessRights
		if err := cur.Decode(&orgAccessRights); err != nil {
			return nil, err
		}
		data = append(data, orgAccessRights)
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}
	return data, nil
}

func (mgr *manager) DeleteOrgAccessRights(id primitive.ObjectID) error {
	collection := mgr.connection.Database("Invoicedatabase").Collection("orgAccessRights")
	filter := bson.D{{"_id", id}}
	_, err := collection.DeleteOne(context.TODO(), filter)
	return err
}

// module
func insertModule(c *gin.Context) {
	var mod Module
	if err := c.BindJSON(&mod); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if mod.ModuleID.IsZero() {
		// Insert a new module
		if err := Mgr.InsertModule(mod); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Module inserted"})
	} else {
		// Update existing module
		if err := Mgr.UpdateModule(mod); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Module updated"})
	}
}

func getAllModules(c *gin.Context) {
	data, err := Mgr.GetAllModules()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": data})
}

func deleteModule(c *gin.Context) {
	id := c.Param("id")
	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := Mgr.DeleteModule(objectId); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Module deleted"})
}

func updateModule(c *gin.Context) {
	var mod Module
	if err := c.BindJSON(&mod); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := Mgr.UpdateModule(mod); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Module updated"})
}

//interface module

func (mgr *manager) InsertModule(data interface{}) error {
	collection := mgr.connection.Database("Invoicedatabase").Collection("modules")
	result, err := collection.InsertOne(context.TODO(), data)
	if err != nil {
		return err
	}
	fmt.Println(result.InsertedID)
	return nil
}

func (mgr *manager) GetAllModules() ([]Module, error) {
	var data []Module
	collection := mgr.connection.Database("Invoicedatabase").Collection("modules")
	cur, err := collection.Find(context.TODO(), bson.M{}, options.Find())
	if err != nil {
		return nil, err
	}
	defer cur.Close(context.TODO())
	for cur.Next(context.TODO()) {
		var module Module
		if err := cur.Decode(&module); err != nil {
			return nil, err
		}
		data = append(data, module)
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}
	return data, nil
}

func (mgr *manager) DeleteModule(id primitive.ObjectID) error {
	collection := mgr.connection.Database("Invoicedatabase").Collection("modules")
	filter := bson.D{{"_id", id}}
	_, err := collection.DeleteOne(context.TODO(), filter)
	return err
}

func (mgr *manager) UpdateModule(module Module) error {
	collection := mgr.connection.Database("Invoicedatabase").Collection("modules")
	filter := bson.D{{"_id", module.ModuleID}}
	update := bson.D{{"$set", module}}
	_, err := collection.UpdateOne(context.TODO(), filter, update)
	return err
}

// Access Rights
func insertAccessRights(c *gin.Context) {
	var rights []AccessRights
	if err := c.BindJSON(&rights); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var newRights []interface{}
	var existingRights []AccessRights

	for _, right := range rights {
		if right.AccessRightsID.IsZero() {
			newRights = append(newRights, right)
		} else {
			existingRights = append(existingRights, right)
		}
	}

	if len(newRights) > 0 {
		if err := Mgr.InsertAccessRights(newRights); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	if len(existingRights) > 0 {
		if err := Mgr.UpdateAccessRights(existingRights); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Access rights processed"})
}

func (mgr *manager) InsertAccessRights(newRights []interface{}) error {
	collection := mgr.connection.Database("Invoicedatabase").Collection("accessRights")
	_, err := collection.InsertMany(context.TODO(), newRights)
	if err != nil {
		return err
	}
	return nil
}

func (mgr *manager) UpdateAccessRights(accessRights []AccessRights) error {
	collection := mgr.connection.Database("Invoicedatabase").Collection("accessRights")
	var models []mongo.WriteModel

	for _, right := range accessRights {
		filter := bson.D{{"_id", right.AccessRightsID}}
		update := bson.D{{"$set", right}}
		model := mongo.NewUpdateOneModel().SetFilter(filter).SetUpdate(update)
		models = append(models, model)
	}

	bulkOption := options.BulkWrite().SetOrdered(false)
	_, err := collection.BulkWrite(context.TODO(), models, bulkOption)
	return err
}

func getAllAccessRights(c *gin.Context) {
	data, err := Mgr.GetAllAccessRights()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": data})
}

func (mgr *manager) GetAllAccessRights() ([]AccessRights, error) {
	var data []AccessRights
	collection := mgr.connection.Database("Invoicedatabase").Collection("accessRights")
	cur, err := collection.Find(context.TODO(), bson.M{}, options.Find())
	if err != nil {
		return nil, err
	}
	defer cur.Close(context.TODO())
	for cur.Next(context.TODO()) {
		var rights AccessRights
		if err := cur.Decode(&rights); err != nil {
			return nil, err
		}
		data = append(data, rights)
	}
	if err := cur.Err(); err != nil {
		return nil, err
	}
	return data, nil
}

// other methods and interfaces
func getUsersByOrganization(c *gin.Context) {
	orgID := c.Param("id")

	objectID, err := primitive.ObjectIDFromHex(orgID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid organization ID"})
		return
	}

	users, err := Mgr.GetUsersByOrganization(objectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	// c.JSON(http.StatusOK, gin.H{"users": users})
	c.JSON(http.StatusOK, users)
}

func (mgr *manager) GetUsersByOrganization(orgID primitive.ObjectID) ([]OrganizationUserResponse, error) {
	var users []OrganizationUserResponse

	// Fetch the organization details
	orgCollection := mgr.connection.Database("Invoicedatabase").Collection("organizations")
	var org Organization
	err := orgCollection.FindOne(context.TODO(), bson.D{{"_id", orgID}}).Decode(&org)
	if err != nil {
		return nil, err
	}

	// Query the database for users related to the organization ID
	orgUserCollection := mgr.connection.Database("Invoicedatabase").Collection("organizationUsers")
	filter := bson.D{{"organizationId", orgID}, {"userStatus", "active"}}
	cur, err := orgUserCollection.Find(context.TODO(), filter)
	if err != nil {
		return nil, err
	}
	defer cur.Close(context.TODO())

	for cur.Next(context.TODO()) {
		var user OrganizationUser
		if err := cur.Decode(&user); err != nil {
			return nil, err
		}

		userResponse := OrganizationUserResponse{
			UserID:         user.UserID,
			OrganizationID: user.OrganizationID,
			Name:           user.Name,
			UserEmail:      user.UserEmail,
			UserPhone:      user.UserPhone,
			UserStatus:     user.UserStatus,
			UserRoleID:     user.UserRoleID,
			OrgName:        org.OrgName,
			OrgCode:        org.OrgCode,
		}
		users = append(users, userResponse)
	}

	if err := cur.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

func getOrgModuleListByOrgID(c *gin.Context) {
	id := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid organization ID"})
		return
	}

	modules, err := Mgr.GetOrgModuleListByOrgID(objectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"modules": modules})
}

func (m *manager) GetOrgModuleListByOrgID(orgID primitive.ObjectID) ([]Module, error) {
	var modules []Module

	// Define MongoDB collections
	organizationsCollection := m.connection.Database("Invoicedatabase").Collection("organizations")
	orgAccessRightsCollection := m.connection.Database("Invoicedatabase").Collection("orgAccessRights")
	modulesCollection := m.connection.Database("Invoicedatabase").Collection("modules")

	// Verify that the organization exists
	var organization Organization
	err := organizationsCollection.FindOne(m.ctx, bson.M{"_id": orgID}).Decode(&organization)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("organization not found")
		}
		return nil, fmt.Errorf("failed to find organization: %v", err)
	}

	// Find all module IDs related to the organization
	cursor, err := orgAccessRightsCollection.Find(m.ctx, bson.M{"orgId": orgID})
	if err != nil {
		return nil, fmt.Errorf("failed to find access rights: %v", err)
	}
	defer cursor.Close(m.ctx)

	var orgAccessRights []OrgAccessRights
	if err := cursor.All(m.ctx, &orgAccessRights); err != nil {
		return nil, fmt.Errorf("failed to decode access rights: %v", err)
	}

	// Extract all unique module IDs
	moduleIDs := make(map[primitive.ObjectID]bool)
	for _, accessRight := range orgAccessRights {
		moduleIDs[accessRight.ModuleID] = true
	}

	var moduleObjectIDs []primitive.ObjectID
	for id := range moduleIDs {
		moduleObjectIDs = append(moduleObjectIDs, id)
	}

	// Find all modules by the module IDs
	cursor, err = modulesCollection.Find(m.ctx, bson.M{"_id": bson.M{"$in": moduleObjectIDs}})
	if err != nil {
		return nil, fmt.Errorf("failed to find modules: %v", err)
	}
	defer cursor.Close(m.ctx)

	if err := cursor.All(m.ctx, &modules); err != nil {
		return nil, fmt.Errorf("failed to decode modules: %v", err)
	}

	return modules, nil
}
