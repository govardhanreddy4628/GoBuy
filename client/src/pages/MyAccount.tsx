import { FiLogOut } from "react-icons/fi";
import { accountMenu } from "../data/accountMenu";
import { Outlet, useNavigate } from "react-router-dom";
import Layout from "../components/layout";
import { useAuth } from "../context/authContext";

const MyAccount = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  }

  return (
    <Layout>
      <div className="p-5 flex gap-4 w-[95%] items-start">

        {/* part 1 */}
        <section className="w-[18%] min-w-56 shadow-md border 
  bg-white dark:bg-gray-900 
  border-gray-200 dark:border-gray-700">

          <div className="bg-white dark:bg-gray-900 flex flex-col items-center p-5">
            <div className="relative w-24 h-24 rounded-full overflow-hidden 
      border-2 border-dashed border-gray-300 dark:border-gray-600 mb-3">

              {user?.avatar ? (
                <img
                  src={user.avatar}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center 
          text-xs text-gray-500 dark:text-gray-400">
                  Upload Photo
                </div>
              )}
            </div>

            {user && (
              <>
                <h3 className="text-[16px] text-gray-800 dark:text-gray-100">
                  {user?.fullName}
                </h3>
                <h6 className="text-[14px] text-gray-600 dark:text-gray-400">
                  {user.email}
                </h6>
              </>
            )}
          </div>

          <div>
            <ul className="bg-gray-200 dark:bg-gray-800 
      flex gap-1 flex-col py-2 pl-4 
      transition-all ease-in-out">

              {accountMenu.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-2 items-center 
            hover:bg-gray-100 dark:hover:bg-gray-700 
            p-2 rounded-sm cursor-pointer 
            text-gray-800 dark:text-gray-200"
                  onClick={() => navigate(`/myaccount/${item.path}`)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </li>
              ))}

              {/* Logout */}
              <li
                className="flex gap-2 items-center 
          hover:bg-gray-100 dark:hover:bg-gray-700 
          p-2 rounded-sm cursor-pointer 
          text-red-600 dark:text-red-400"
                onClick={handleLogout}
              >
                <FiLogOut />
                <span>Logout</span>
              </li>
            </ul>
          </div>
        </section>

        {/* part 2 */}
        <section className="w-[85%] shadow-md border border-gray-200 dark:border-gray-600 p-4 bg-white dark:bg-gray-900 rounded-md animate-fadein">
          <Outlet />
        </section>
      </div>
    </Layout>
  );
};

export default MyAccount;
