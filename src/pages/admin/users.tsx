// Mantine components
import { Table, Title } from "@mantine/core";

// Types
import type { GetServerSideProps, NextPage } from "next";
import StandardLayout from "~/layouts/StandardLayout";

// API & Auth
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

// Other components

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  if (session?.user.role !== "ADMIN") return { notFound: true };
  return { props: { session } };
};

const UsersPage: NextPage = () => {
  const users = api.users.getAll.useQuery();

  return (
    <StandardLayout title="Users">
      <Title mb="xl">Users</Title>
      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Sign in method(s)</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.data?.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.accounts.map((a) => a.provider).join(", ")}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </StandardLayout>
  );
};

export default UsersPage;
