import { useRouter } from "next/router";
import { Button, Text } from "@mantine/core";
import { cleanNotifications, showNotification, NotificationProps } from "@mantine/notifications";
import { Check, X } from "tabler-icons-react";
import { useModals } from '@mantine/modals';


export default function DeleteButton () {
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
    
    fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}/${id}`, {
      method: "DELETE"
    })
    .then((response) => {
    if (response.status === 201 || response.status === 200 || response.status === 204) {
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
            console.log("hereverybad")
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
   
   }
    
    const openDeleteModal = () =>
      modals.openConfirmModal({
        title: 'Delete Resource!!!!!',
        centered: true,
        children: (
          <Text size="sm">
            Are you sure you want to delete {resourceType} {id}? 
          </Text>
        ),
        labels: { confirm: 'Delete', cancel: "Cancel" },
        confirmProps: { color: 'red' },
        onCancel: () => console.log("cancel"),
        onConfirm: () => deleteHandler()
      });
      
    return <Button 
        onClick={openDeleteModal} 
        color="cyan"
        radius="md"
        size="sm"
        variant="filled"
        style={{
          float: "right",
        }}>Delete</Button>
  }