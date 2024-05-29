package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

type Organization struct {
	OrgID              primitive.ObjectID `json:"orgId,omitempty" bson:"_id,omitempty"`
	OrgCode            string             `json:"orgCode" bson:"orgCode"`
	OrgName            string             `json:"orgName" bson:"orgName"`
	ContactPerson      string             `json:"contactPerson" bson:"contactPerson"`
	ContactPersonEmail string             `json:"contactPersonEmail" bson:"contactPersonEmail"`
	ContactPersonPhone string             `json:"contactPersonPhone" bson:"contactPersonPhone"`
	OrgStatus          string             `json:"orgStatus" bson:"orgStatus"`
}

type OrganizationUser struct {
	UserID         primitive.ObjectID `json:"userId,omitempty" bson:"_id,omitempty"`
	OrganizationID primitive.ObjectID `json:"organizationId" bson:"organizationId"`
	Name           string             `json:"name" bson:"name"`
	UserEmail      string             `json:"userEmail" bson:"userEmail"`
	UserPhone      string             `json:"userPhone" bson:"userPhone"`
	UserStatus     string             `json:"userStatus" bson:"userStatus"`
	UserRoleID     primitive.ObjectID `json:"userRoleId" bson:"userRoleId"`
}

type UserRole struct {
	RoleID     primitive.ObjectID `json:"roleId,omitempty" bson:"_id,omitempty"`
	RoleName   string             `json:"roleName" bson:"roleName"`
	RoleStatus string             `json:"roleStatus" bson:"roleStatus"`
}

type OrgAccessRights struct {
	AccessRightsID primitive.ObjectID `json:"accessRightsId,omitempty" bson:"_id,omitempty"`
	OrgID          primitive.ObjectID `json:"orgId" bson:"orgId"`
	ModuleID       primitive.ObjectID `json:"moduleId" bson:"moduleId"`
	Permission     string             `json:"permission" bson:"permission"`
}

type Module struct {
	ModuleID   primitive.ObjectID `json:"moduleId,omitempty" bson:"_id,omitempty"`
	ModuleName string             `json:"moduleName" bson:"moduleName"`
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
	// Insert(interface{}) error
	Insert(interface{}) (primitive.ObjectID, error)
	GetAll() ([]Organization, error)
	SetOrganizationStatusToInactive(id primitive.ObjectID) error
	GetOrganizationByID(id primitive.ObjectID) (Organization, error)
	UpdateData(Organization) error

	InsertOrganizationUser(interface{}) error
	GetAllOrganizationUsers() ([]OrganizationUser, error)
	SetUserStatusToInactive(id primitive.ObjectID) error
	GetUserByID(id primitive.ObjectID) (OrganizationUser, error)
	UpdateOrganizationUser(OrganizationUser) error

	InsertUserRole(interface{}) error
	GetAllUserRoles() ([]UserRole, error)
	SetRoleStatusToInactive(id primitive.ObjectID) error
	GetUserRoleByID(id primitive.ObjectID) (UserRole, error)
	UpdateUserRole(UserRole) error

	InsertOrgAccessRights(interface{}) error
	GetAllOrgAccessRights() ([]OrgAccessRights, error)
	DeleteOrgAccessRights(primitive.ObjectID) error
	UpdateOrgAccessRights(OrgAccessRights) error

	InsertModule(interface{}) error
	GetAllModules() ([]Module, error)
	DeleteModule(primitive.ObjectID) error
	UpdateModule(Module) error

	GetUsersByOrganization(objectID primitive.ObjectID) ([]OrganizationUserResponse, error)
}

func connectDb() {
	uri := "mongodb://localhost:27017"
	client, err := mongo.NewClient(options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatalf("Failed to create MongoDB client: %v", err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	err = client.Connect(ctx)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
	}
	fmt.Println("Connected!!!")
	Mgr = &manager{connection: client, ctx: ctx, cancel: cancel}
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

func main() {
	r := gin.Default()
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
	r.PUT("/org-access-rights", updateOrgAccessRights)
	r.POST("/modules", insertModule)
	r.GET("/modules", getAllModules)
	r.DELETE("/modules/:id", deleteModule)
	r.PUT("/modules", updateModule)

	r.GET("/organizations/:id", getUsersByOrganization)

	r.Run(":9090")

}

// func insertOrganization(c *gin.Context) {
// 	var org Organization
// 	if err := c.BindJSON(&org); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}

// 	if org.OrgID.IsZero() {
// 		// Insert a new organization
// 		if err := Mgr.Insert(org); err != nil {
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
// 			return
// 		}
// 		c.JSON(http.StatusOK, gin.H{"message": "Organization inserted"})

//		} else {
//			// Update existing organization
//			if err := Mgr.UpdateData(org); err != nil {
//				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
//				return
//			}
//			c.JSON(http.StatusOK, gin.H{"message": "Organization updated"})
//		}
//	}
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

		// Create a directory named with the OrgID
		folderName := orgID.Hex()
		err = os.Mkdir(folderName, 0755)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create folder"})
			return
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

//method of user

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

func insertUserRole(c *gin.Context) {
	var role UserRole
	if err := c.BindJSON(&role); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if role.RoleID.IsZero() {
		// Insert a new user role
		if err := Mgr.InsertUserRole(role); err != nil {
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

func insertOrgAccessRights(c *gin.Context) {
	var rights OrgAccessRights
	if err := c.BindJSON(&rights); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if rights.AccessRightsID.IsZero() {
		// Insert a new organization access rights
		if err := Mgr.InsertOrgAccessRights(rights); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Organization access rights inserted"})
	} else {
		// Update existing organization access rights
		if err := Mgr.UpdateOrgAccessRights(rights); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Organization access rights updated"})
	}
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

func updateOrgAccessRights(c *gin.Context) {
	var rights OrgAccessRights
	if err := c.BindJSON(&rights); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := Mgr.UpdateOrgAccessRights(rights); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "OrgAccessRights updated"})
}

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

//interface--------------------------

// func (mgr *manager) Insert(data interface{}) error {
// 	orgCollection := mgr.connection.Database("Invoicedatabase").Collection("organizations")
// 	result, err := orgCollection.InsertOne(context.TODO(), data)
// 	if err != nil {
// 		return err
// 	}
// 	fmt.Println(result.InsertedID)
// 	return nil
// }

func (mgr *manager) Insert(data interface{}) (primitive.ObjectID, error) {
	orgCollection := mgr.connection.Database("Invoicedatabase").Collection("organizations")
	result, err := orgCollection.InsertOne(context.TODO(), data)
	if err != nil {
		return primitive.NilObjectID, err
	}
	orgID := result.InsertedID.(primitive.ObjectID)
	fmt.Println(orgID)
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

func (mgr *manager) InsertUserRole(data interface{}) error {
	roleCollection := mgr.connection.Database("Invoicedatabase").Collection("userRoles")
	result, err := roleCollection.InsertOne(context.TODO(), data)
	if err != nil {
		return err
	}
	fmt.Println(result.InsertedID)
	return nil
}

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

func (mgr *manager) InsertOrgAccessRights(data interface{}) error {
	collection := mgr.connection.Database("Invoicedatabase").Collection("orgAccessRights")
	result, err := collection.InsertOne(context.TODO(), data)
	if err != nil {
		return err
	}
	fmt.Println(result.InsertedID)
	return nil
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

func (mgr *manager) UpdateOrgAccessRights(orgAccessRights OrgAccessRights) error {
	collection := mgr.connection.Database("Invoicedatabase").Collection("orgAccessRights")
	filter := bson.D{{"_id", orgAccessRights.AccessRightsID}}
	update := bson.D{{"$set", orgAccessRights}}
	_, err := collection.UpdateOne(context.TODO(), filter, update)
	return err
}

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
