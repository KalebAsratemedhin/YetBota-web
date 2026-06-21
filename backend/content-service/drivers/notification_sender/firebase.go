package notificationsender

import (
	"context"
	"fmt"

	toddlerr "github.com/beka-birhanu/toddler/error"
	"github.com/beka-birhanu/toddler/status"
	"github.com/beka-birhanu/yetbota/content-service/drivers/validator"
	"github.com/beka-birhanu/yetbota/content-service/internal/domain/notification"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/messaging"
	"golang.org/x/sync/errgroup"
)

type FirebaseSender struct {
	app                          *firebase.App
	androidNotificationChannelID string
}

type Config struct {
	App                          *firebase.App `validate:"required"`
	AndroidNotificationChannelID string        `validate:"required"`
}

func (c *Config) Validate() error {
	if err := validator.Validate.Struct(c); err != nil {
		return toddlerr.FromValidationErrors(err)
	}
	return nil
}

func NewFirebaseSender(c *Config) (notification.Sender, error) {
	if err := c.Validate(); err != nil {
		return nil, err
	}
	return &FirebaseSender{
		app:                          c.App,
		androidNotificationChannelID: c.AndroidNotificationChannelID,
	}, nil
}

// Send implements notification.Sender.
func (f *FirebaseSender) Send(ctx context.Context, data *notification.NotificationData) error {
	client, err := f.app.Messaging(ctx)
	if err != nil {
		return &toddlerr.Error{
			PublicStatusCode:  status.ServerError,
			ServiceStatusCode: status.ServerErrorServiceCommunication,
			PublicMessage:     "Sorry, we are experiencing some technical difficulties. Please try again later.",
			ServiceMessage:    fmt.Sprintf("error creating firebase messaging client: %s", err.Error()),
		}
	}

	eg, egCtx := errgroup.WithContext(ctx)

	for _, token := range data.Receivers {
		eg.Go(func() error {
			msg := &messaging.Message{
				Token: token,
				Data:  data.Data,
			}

			if data.Count > 0 {
				msg.APNS = &messaging.APNSConfig{
					Payload: &messaging.APNSPayload{
						Aps: &messaging.Aps{
							Badge: &data.Count,
						},
					},
				}
				msg.Android = &messaging.AndroidConfig{
					Notification: &messaging.AndroidNotification{
						NotificationCount: &data.Count,
						ChannelID:         f.androidNotificationChannelID,
					},
				}
			}

			if data.Title != "" {
				msg.Notification = &messaging.Notification{
					Title:    data.Title,
					Body:     data.Body,
					ImageURL: data.ImageURL,
				}
			}

			_, err := client.Send(egCtx, msg)
			if err != nil {
				if messaging.IsRegistrationTokenNotRegistered(err) {
					return nil
				}
				return err
			}
			return nil
		})
	}

	if err := eg.Wait(); err != nil {
		return &toddlerr.Error{
			PublicStatusCode:  status.ServerError,
			ServiceStatusCode: status.ServerErrorServiceCommunication,
			PublicMessage:     "Sorry, we are experiencing some technical difficulties. Please try again later.",
			ServiceMessage:    fmt.Sprintf("error pushing notifications: %s", err.Error()),
		}
	}

	return nil
}
