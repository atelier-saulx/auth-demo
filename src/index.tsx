import { render } from "react-dom";
import React from "react";
import {
  Provider,
  Authorize,
  Topbar,
  LoadingIcon,
  Text,
  useContextMenu,
  StackedListItemsWrapper,
  StackedListItem,
  Avatar,
  UserProfile,
  Button,
  AddIcon,
  EditIcon,
  useSelect,
  Input,
  CheckIcon,
} from "@based/ui";
import based from "@based/client";
import { useClient, useData } from "@based/react";
import { prettyDate } from "@based/pretty-date";
import basedConfig from "../based.json";

export const client = based(basedConfig);

const Todo = ({ id, name, description, createdAt, done }) => {
  const client = useClient();
  return (
    <StackedListItem border>
      <Avatar
        size={40}
        icon={done ? CheckIcon : EditIcon}
        color={done ? "green" : "accent"}
        onClick={() => {
          client.set({ $id: id, done: !done });
        }}
      />
      <div>
        <Input
          value={name}
          ghost
          onChange={(name) => {
            client.set({ $id: id, name });
          }}
          type="text"
        />
        <Text color="text2">{description}</Text>
        <Text>{prettyDate(createdAt, "date-time")}</Text>
      </div>
    </StackedListItem>
  );
};

const Todos = ({ id = "root" }) => {
  const client = useClient();
  const [value, open] = useSelect(["Todo", "All", "Completed"], "All");

  const filter: any[] = [
    {
      $field: "type",
      $operator: "=",
      $value: "todo",
    },
  ];

  if (value === "Completed" || value == "Todo") {
    filter.push({
      $field: "done",
      $operator: "=",
      $value: value === "Completed",
    });
  }

  const { data, loading } = useData("observeTodos", {
    id,
    filter,
  });

  // const { data, loading } = useData({
  //   $id: id,
  //   todos: {
  //     id: true,
  //     done: true,
  //     name: true,
  //     createdAt: true,
  //     description: true,
  //     $list: {
  //       $sort: {
  //         $field: "createdAt",
  //         $order: "asc",
  //       },
  //       $limit: 100,
  //       $offset: 0,
  //       $find: {
  //         $traverse: "children",
  //         $filter: filter,
  //       },
  //     },
  //   },
  // });

  return (
    <div
      style={{
        padding: "32px 48px",
        height: "calc(100vh - 66px)",
        width: "100%",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {loading ? (
        <LoadingIcon />
      ) : (
        <StackedListItemsWrapper
          topLeft={
            <>
              <Text color="text2">Todos</Text>
              <Button ghost onClick={open}>
                {value || "All"}
              </Button>
            </>
          }
          topRight={
            <>
              <Button
                onClick={async () => {
                  await client.set({
                    type: "todo",
                    done: false,
                    name: "New todo",
                    parents: [id],
                  });
                }}
                icon={AddIcon}
                ghost
              >
                Add Todo
              </Button>
            </>
          }
        >
          {data.todos?.map((t) => {
            return <Todo {...t} key={t.id} />;
          })}
        </StackedListItemsWrapper>
      )}
    </div>
  );
};

const App = ({ user }: { user: { id: string; token: string } }) => {
  return (
    <>
      <Topbar
        onProfile={useContextMenu(
          UserProfile,
          { id: user.id },
          { position: "right", offset: { x: 0, y: 28 } }
        )}
      />
      <Todos id={user.id} />;
    </>
  );
};

render(
  <Provider theme="light" client={client}>
    <Authorize app={App} />
  </Provider>,
  document.body
);
