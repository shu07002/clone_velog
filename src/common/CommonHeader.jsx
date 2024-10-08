import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginModalPortal } from "../portal/LoginModalPortal";
import LoginModal from "../components/Login/LoginModal";
import { auth, database } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const CommonHeader = ({ location, isLoggedIn, headerRef }) => {
  const CURRENT_USER = JSON.parse(window.localStorage.getItem("CURRENT_USER"));
  const [loginModal, setLoginModal] = useState(false);
  const navigate = useNavigate();
  const scrollRef = useRef(136);
  const [expand, setExpand] = useState(false);
  const [post, setPost] = useState();

  const closeMenuRef = useRef();
  const menuRef = useRef();
  const onClickLogo = () => {
    navigate("/");
  };

  const onClickNickname = () => {
    navigate(`/@${post?.authorId}`);
  };

  const [openMenu, setOpenMenu] = useState(false);

  const clickOutside = (e) => {
    if (
      closeMenuRef.current &&
      !closeMenuRef.current.contains(e.target) &&
      menuRef.current &&
      !menuRef.current.contains(e.target)
    ) {
      setOpenMenu(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef?.current) {
        if (window.scrollY >= scrollRef.current) {
          headerRef.current.style.setProperty("transform", "translateY(-200%)");
          headerRef.current.style.setProperty("transition", "transform 0.15s");
        } else {
          headerRef.current.style.removeProperty("transform");
        }
        if (window.scrollY > 80) {
          scrollRef.current = window.scrollY;
        }

        if (window.scrollY > 136) setExpand(true);
        else setExpand(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousedown", clickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousedown", clickOutside);
    };
  }, [headerRef]);

  useEffect(() => {
    const fetchData = async () => {
      const postQuery = query(
        collection(database, "posts"),
        where("id", "==", location.pathname.split("/posting/")[1])
      );

      const postQuerySnapshot = await getDocs(postQuery);
      setPost(postQuerySnapshot.docs[0].data());
    };

    if (location.pathname.startsWith("/posting")) {
      fetchData();
    }
  }, []);

  const onClickLogin = () => {
    setLoginModal(!loginModal);
  };

  const onLogout = async (e) => {
    e.stopPropagation();
    try {
      await auth.signOut();
      window.localStorage.removeItem("CURRENT_USER");
      navigate("/");
    } catch (error) {
      alert("로그아웃에 실패했습니다.");
    }
  };

  const onClickMenu = () => {
    if (openMenu) {
      setOpenMenu(!openMenu);
    } else {
      setOpenMenu(!openMenu);
    }
  };

  return (
    <div className={headerRef ? "header-expander" : ""} ref={headerRef}>
      <header className={`${expand ? "expand-header" : "normal-header"}`}>
        <h1 className="header-logo">
          {location.pathname.startsWith("/posting") ? (
            <div className="logo-and-nickname">
              <div className="logo-box" onClick={onClickLogo}>
                K
              </div>
              <div onClick={onClickNickname}>{post?.authorId}</div>
            </div>
          ) : (
            <span onClick={onClickLogo}>Kelog</span>
          )}
        </h1>

        <div className="header-buttons">
          <div className="alarm">
            <img
              className="header-icons"
              src="../../icons/bell-regular.svg"
              alt="bell"
            />
          </div>

          {isLoggedIn && CURRENT_USER ? (
            <div className="loggedInDiv">
              <button className="write" onClick={() => navigate("/write")}>
                새 글 작성
              </button>
              <div ref={closeMenuRef} className="detail" onClick={onClickMenu}>
                <img src={CURRENT_USER.profile_image_url} alt="user-image" />
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 24 24"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7 10l5 5 5-5z"></path>
                </svg>
              </div>

              {openMenu && (
                <div className="menu" ref={menuRef}>
                  <div>
                    <a href={`/@${CURRENT_USER.nickname}`}>
                      <div>내 블로그</div>
                    </a>
                    <a href="/write" className="responsive-write">
                      <div>새 글 작성</div>
                    </a>
                    <a>
                      <div>임시 글</div>
                    </a>
                    <a>
                      <div>읽기 목록</div>
                    </a>
                    <a>
                      <div>설정</div>
                    </a>
                    <a>
                      <div onClick={onLogout}>로그아웃</div>
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button className="header-login-button" onClick={onClickLogin}>
              로그인
            </button>
          )}
        </div>

        {loginModal && (
          <LoginModalPortal>
            <LoginModal onClickLogin={onClickLogin} />
          </LoginModalPortal>
        )}
      </header>
    </div>
  );
};

export default CommonHeader;
