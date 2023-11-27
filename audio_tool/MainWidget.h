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
    // �������״̬
    bool detectConnectState(QString& strDevice, QProcess* pProcesss);
    // �����ļ�������
    bool changeDirName();

    // ���̴߳�����
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

    // ��ʱ�洢�ļ�
    void slotSaveFile();

	void slotChangeStartBtn(const bool& bStart, const bool& bErr, const QString& strText);
	void slotShowInfo(const bool bErr, const QString& strText);
	void slotCtrlClockTimer(const int& iState);
	void slotSplitSave(const bool& bStart);

private:
    Ui::MainWidgetClass ui;
    std::atomic<bool> m_bStartCap{ false };     // ��ť��״̬����������ֹͣ��
    std::atomic<bool> m_bConnect{ false };      // ����״̬

    QFileDialog* m_pFileDialog{ nullptr };

	QProcess* m_pProcess{ nullptr };
    QProcess* m_pThreadProcess{ nullptr };   // ����ִ���̴߳�����ָ���ʵ�������̴߳����ģ����߳��޷�ʹ��
    QTimer* m_pPullFileTimer{ nullptr };     // ���ڶ�ʱ�洢�ļ�

	std::atomic<bool> m_bStop{ false };
	std::mutex m_objLock;
	std::condition_variable m_objCondi;
	std::list<ECtrlCmd> m_listCmd;
    std::thread m_objCmdThread;
    ECtrlCmd m_enCurCmd{ ECtrlCmd::emFree };
    bool m_bWait{ false };
    int m_iSplitFileTime{ 0 };
};
