package auth

import (
	toddlerr "github.com/beka-birhanu/toddler/error"
	"github.com/beka-birhanu/toddler/status"
	"github.com/beka-birhanu/yetbota/identity-service/drivers/constants"
	"github.com/nyaruka/phonenumbers"
)

func normalizePhone(mobile string) (string, error) {
	parsed, err := phonenumbers.Parse(mobile, constants.DefaultPhoneRegion)
	if err != nil {
		return "", err
	}
	if !phonenumbers.IsValidNumber(parsed) {
		return "", &toddlerr.Error{
			PublicStatusCode:  status.BadRequest,
			PublicMessage:     "Invalid phone number",
			ServiceStatusCode: status.BadRequestMissingField,
			ServiceMessage:    "invalid phone number",
		}
	}
	return phonenumbers.Format(parsed, phonenumbers.E164), nil
}

func invalidCredentialsError() error {
	return &toddlerr.Error{
		PublicStatusCode:  status.Unauthorized,
		ServiceStatusCode: status.Unauthorized,
		PublicMessage:     "Invalid username or password",
		ServiceMessage:    "invalid credentials",
	}
}
