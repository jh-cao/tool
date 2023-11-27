#pragma once

#include <QtWidgets/QWidget>
#include "ui_MainWidget.h"

#include <QFileDialog>
#include <atomic>
#include <QTimer>
#include <QProcess>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <chrono>


typedef enum
{
	emDevices,
	emRoot,
	emRemount,
	emStart,
	emStop,
	emPull,
} ECmdNum;

typedef enum
{
    emFree,
    emStartCap,
    emStopCap,
    emPullFile,
    emSave,
} ECtrlCmd;

class MainWidget : public QWidget
{
    Q_OBJECT

public:
    MainWidget(QWidget *parent = nullptr);
    ~MainWidget();

private:
    void initUi();
    void initConnect();

    bool addTask(const int& iCmd, QString& strRetInfo, QProcess* pProcesss);
    // 检测连接状态
    bool detectConnectState(QString& strDevice, QProcess* pProcesss);
    // 更改文件夹名称
    bool changeDirName();

    // 子线程处理函数
	void runThreadCmd();
	void addThreadTask(ECtrlCmd enCmd);

signals:
    void signalChangeStartBtn(const bool& bStart, const bool& bErr, const QString& strText);
	void signalShowInfo(const bool bErr, const QString& strText);
	void signalCtrlClockTimer(const int& iState);
	void signalSplitSave(const bool& bStart);


private slots:
    void slotSelectFilePath();
    void slotShowPath(const QString& strPath);
    void slotStartCaptureAudio();
    void slotDetectStatus();

    // 定时存储文件
    void slotSaveFile();

	void slotChangeStartBtn(const bool& bStart, const bool& bErr, const QString& strText);
	void slotShowInfo(const bool bErr, const QString& strText);
	void slotCtrlClockTimer(const int& iState);
	void slotSplitSave(const bool& bStart);

private:
    Ui::MainWidgetClass ui;
    std::atomic<bool> m_bStartCap{ false };     // 按钮的状态（启动或者停止）
    std::atomic<bool> m_bConnect{ false };      // 连接状态

    QFileDialog* m_pFileDialog{ nullptr };

	QProcess* m_pProcess{ nullptr };
    QProcess* m_pThreadProcess{ nullptr };   // 任务执行线程创建的指令处理实例，主线程创建的，子线程无法使用
    QTimer* m_pPullFileTimer{ nullptr };     // 用于定时存储文件

	std::atomic<bool> m_bStop{ false };
	std::mutex m_objLock;
	std::condition_variable m_objCondi;
	std::list<ECtrlCmd> m_listCmd;
    std::thread m_objCmdThread;
    ECtrlCmd m_enCurCmd{ ECtrlCmd::emFree };
    bool m_bWait{ false };
    int m_iSplitFileTime{ 0 };
};
