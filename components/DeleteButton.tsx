import { useRouter } from "next/router";
import { Button, Text } from "@mantine/core";
import { cleanNotifications, showNotification, NotificationProps } from "@mantine/notifications";
import { Check, X } from "tabler-icons-react";
import { useModals } from "@mantine/modals";

/**
 * DeleteButton is a component for rendering a delete resource button
 * @returns Button that, when clicked, displays a notification verifying that the user
 * wants to delete the resource. Only deletes if the user confirms, cancels otherwise.
 */
export default function DeleteButton() {
  const router = useRouter();
  const modals = useModals();
  const { resourceType, id } = router.query;

  let customMessage: NotificationProps["message"] = <div>Problem connecting to server</div>;
  let notifProps: NotificationProps = {
    message: customMessage,
    color: "red",
    icon: <X size={18} />,
    autoClose: false,
  };

  const deleteHandler = () => {
    //delete the resource from the server
    fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.status === 204) {
          customMessage = (
            <>
              <Text>Resource successfully deleted!&nbsp;</Text>
            </>
          );
          notifProps = {
            ...notifProps,
            color: "green",
            icon: <Check size={18} />,
          };

          //return to resource page
          router.push({ pathname: `/${resourceType}` });
        } else {
          customMessage = `${response.status} ${response.statusText}`;
          return response.json();
        }
      })
      .then((responseBody) => {
        if (responseBody) {
          customMessage = (
            <>
              <Text weight={500}>{customMessage}&nbsp;</Text>
              <Text color="red">{responseBody.issue[0].details.text}</Text>
            </>
          );
        }
      })
      .catch((error) => {
        customMessage = (
          <>
            <Text weight={500}>Problem connecting to server:&nbsp;</Text>
            <Text color="red">{error.message}</Text>
          </>
        );
      })
      .finally(() => {
        cleanNotifications();
        showNotification({ ...notifProps, message: customMessage });
      });
  };

  // create a modal verifying if the user wants to delete the given resource
  const openDeleteModal = () =>
    modals.openConfirmModal({
      title: "Delete Resource",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete {resourceType} {id}?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteHandler(),
    });

  return (
    <Button
      onClick={openDeleteModal}
      color="pink"
      radius="md"
      size="sm"
      variant="filled"
      style={{
        float: "right",
        marginRight: "16px",
        marginLeft: "8px",
      }}
    >
      Delete
    </Button>
  );
}
