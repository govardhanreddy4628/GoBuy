import { FiLogOut } from "react-icons/fi";
import { accountMenu } from "../data/accountMenu";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/layout";
import { useAuth } from "../context/authContext";

const MyAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <Layout>
      <div className="min-h-[80vh] bg-gray-50 py-8 px-4">
        <div className="max-w-9xl mx-auto flex gap-6">

          {/* ================= SIDEBAR ================= */}
          <aside className="w-64 bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b flex flex-col items-center">

              {/* Avatar */}
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-red-400 shadow-sm mb-3">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-sm text-gray-500">
                    No Photo
                  </div>
                )}
              </div>

              <h3 className="font-semibold text-lg">
                {user?.name}
              </h3>
              <p className="text-sm text-gray-500">
                {user?.email}
              </p>
            </div>

            <ul className="p-3 space-y-1">
              {accountMenu.map((item) => {
                const isActive = location.pathname.includes(item.path);

                return (
                  <li
                    key={item.id}
                    onClick={() => navigate(`/myaccount/${item.path}`)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition
                      ${isActive
                        ? "bg-red-50 text-red-500 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                      }`}
                  >
                    {item.icon}
                    {item.label}
                  </li>
                );
              })}

              {/* Logout */}
              <li
                onClick={logout}
                className="flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-100 text-gray-700"
              >
                <FiLogOut />
                Logout
              </li>
            </ul>
          </aside>

          {/* ================= CONTENT ================= */}
          <main className="flex-1 bg-white rounded-xl shadow-sm border p-8 min-h-[500px]">
            <Outlet />
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default MyAccount;