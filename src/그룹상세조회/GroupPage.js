//groupPage

import React, { useEffect, useState } from "react";
import "./GroupPage.css";

const GroupPage = ({ groupId }) => {
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    name: "",
    imageUrl: "",
    introduction: "",
    isPublic: 0,
    password: "",
  });
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);

  // 그룹 ID가 변경될 때마다 데이터 새로 가져오기
  useEffect(() => {
    const fetchGroupData = async () => {
      setLoading(true); // 로딩 상태 시작
      try {
        const response = await fetch(`/api/groups/${groupId}`);
        if (!response.ok) {
          throw new Error("네트워크 오류");
        }
        const data = await response.json();
        setGroupData(data);
        setNewGroupData(data); // 초기화 시 그룹 데이터로 설정
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // 로딩 상태 종료
      }
    };

    if (groupId) {
      fetchGroupData();
    }
  }, [groupId]);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsPasswordCorrect(false);
  };

  const handlePasswordChange = (e) => {
    setNewGroupData({ ...newGroupData, password: e.target.value });
  };

  const handleUpdateGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}`);
      const data = await response.json();

      if (newGroupData.password === data.password) {
        setIsPasswordCorrect(true);
      } else {
        alert("비밀번호가 일치하지 않습니다.");
      }
    } catch (err) {
      alert("비밀번호 확인 중 오류 발생");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/groups/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGroupData),
      });
      if (!response.ok) {
        throw new Error("수정 실패");
      }
      const updatedData = await response.json();
      setGroupData(updatedData);
      handleModalClose();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteGroup = async () => {
    if (window.confirm("정말로 이 그룹을 삭제하시겠습니까?")) {
      try {
        const response = await fetch(`/api/groups/delete/${groupId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("삭제 실패");
        }
        alert("그룹이 삭제되었습니다.");
        setGroupData(null);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleSendLike = async () => {
    try {
      const response = await fetch("/api/groups/like", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("공감 보내기 실패");
      }
      alert("공감이 전송되었습니다.");
      setGroupData((prev) => ({ ...prev, likeCount: prev.likeCount + 1 }));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>오류 발생: {error}</p>;

  return (
    <div className="group-container">
      <div className="group-image">
        <img
          src={groupData.imageUrl || "logo.png"} // 기본 이미지 경로로 수정하세요
          alt="그룹 이미지"
        />
      </div>
      <div className="group-info">
        <h1>{groupData.name}</h1>
        <p>
          D+
          {Math.floor(
            (new Date() - new Date(groupData.createdAt)) / (1000 * 60 * 60 * 24)
          )}{" "}
          | {groupData.isPublic ? "공개" : "비공개"}
        </p>
        <p>
          게시물 {groupData.postCount} | 그룹 공감 {groupData.likeCount}
        </p>
        <p>{groupData.introduction}</p>
      </div>
      <div className="badges">
        <h2>획득 배지</h2>
        {groupData.badges.length > 0 ? (
          groupData.badges.map((badge, index) => (
            <span key={index}>{badge}</span>
          ))
        ) : (
          <p>획득한 배지가 없습니다.</p>
        )}
      </div>
      <div className="buttons">
        <button onClick={handleModalOpen}>그룹 정보 수정하기</button>
        <button onClick={handleDeleteGroup}>그룹 삭제하기</button>
        <button onClick={handleSendLike}>공감 보내기</button>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>그룹 정보 수정</h2>
            <form onSubmit={handleSubmit}>
              <label>
                그룹명:
                <input
                  type="text"
                  value={newGroupData.name}
                  onChange={(e) =>
                    setNewGroupData({ ...newGroupData, name: e.target.value })
                  }
                />
              </label>
              <label>
                대표 이미지:
                <input
                  type="text"
                  value={newGroupData.imageUrl}
                  onChange={(e) =>
                    setNewGroupData({
                      ...newGroupData,
                      imageUrl: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                그룹 소개:
                <textarea
                  value={newGroupData.introduction}
                  onChange={(e) =>
                    setNewGroupData({
                      ...newGroupData,
                      introduction: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                그룹 공개 선택:
                <div className="switch">
                  <input
                    type="checkbox"
                    checked={newGroupData.isPublic}
                    onChange={(e) =>
                      setNewGroupData({
                        ...newGroupData,
                        isPublic: e.target.checked,
                      })
                    }
                  />
                  <span className="slider round"></span>
                </div>
              </label>
              <label>
                수정 권한 인증:
                <input
                  type="password"
                  value={newGroupData.password}
                  onChange={handlePasswordChange}
                  placeholder="비밀번호를 입력해 주세요"
                />
              </label>
              <button type="button" onClick={handleUpdateGroup}>
                인증
              </button>
              {isPasswordCorrect && <button type="submit">수정하기</button>}
            </form>
            <button onClick={handleModalClose}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupPage;
