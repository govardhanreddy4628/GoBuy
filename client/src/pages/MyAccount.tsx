import { FiLogOut } from "react-icons/fi";
import { accountMenu } from "../data/accountMenu";
import { Outlet, useNavigate } from "react-router-dom";
import Layout from "../components/layout";
import { useAuth } from "../context/authContext";

const MyAccount = () => {
  const navigate = useNavigate();
  const user = useAuth().user;

  return (
    <Layout>
      <div className="p-5 flex gap-4 w-[95%] items-start">

        {/* part 1 */}
        <section className="w-[18%] min-w-56 shadow-md border">
          <div className="bg-white flex flex-col items-center p-5">
            <div className="relative w-28 h-28 rounded-full overflow-hidden border border-red-400 border-dotted mb-2">
              {user?.avatar ? (<img
                src={user?.avatar}
                className=""
              />) : (<div className="w-28 h-14 bg-gray-50 absolute bg-opacity-90 bottom-0 text-sm text-center pt-2">
                Upload photo
              </div>)}
            </div>

            {user && (
              <>
                <h3 className="text-[16px]">{user?.name}</h3>
                <h6 className="text-[14px]">{user.email}</h6>
              </>
            )}

          </div>

          <div>
            <ul className="bg-gray-200 flex gap-1 flex-col py-2 pl-4 transition-all ease-in-out">

              {accountMenu.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-2 items-center hover:bg-gray-100 p-2 rounded-sm cursor-pointer"
                  onClick={() => navigate(`/myaccount/${item.path}`)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </li>
              ))}

              {/* Logout */}
              <li className="flex gap-2 items-center hover:bg-gray-100 p-2 rounded-sm cursor-pointer">
                <FiLogOut />
                <span>Logout</span>
              </li>
            </ul>
          </div>
        </section>

        {/* part 2 */}
        <section className="w-[85%] shadow-md border p-4 bg-white rounded-md animate-fadein">
          <Outlet />
        </section>
      </div>
    </Layout>
  );
};

export default MyAccount;
