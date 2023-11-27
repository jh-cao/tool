#include "MainWidget.h"
#include <QDebug>
#include <QDir>

std::map<int, std::vector<std::string>> g_mapCmd =
{
    {emDevices, {"devices"}},
	{emRoot, {"root"}},
	{emRemount, {"remount"}},
	{emStart, {"shell", "mpf_debug_tool", "data", "save", "1"}},
	{emStop, {"shell", "mpf_debug_tool", "data", "save", "0"}},
	{emPull, {"pull", "/mnt/audio_server",""}},
};

static const QString g_strStartText = u8"��ʼ�ɼ�";
static const QString g_strStopText = u8"ֹͣ�ɼ�";
static const QString g_strDefaultDir = "audio_server";



MainWidget::MainWidget(QWidget *parent)
    : QWidget(parent)
{
    ui.setupUi(this);
    initUi();
    initConnect();
}

MainWidget::~MainWidget()
{
	m_bStop = true;
	m_objCondi.notify_all();
	if (m_objCmdThread.joinable())
	{
		m_objCmdThread.join();
	}

	m_pPullFileTimer->deleteLater();
	m_pProcess->deleteLater();
}

void MainWidget::initUi()
{
	ui.plainTextEdit->setMaximumBlockCount(1000);
    // �ļ���
    m_pFileDialog = new QFileDialog(this);
    // ����ֻ��ʾ�ļ����Լ�ֻ����ʾ�ļ���
    m_pFileDialog->setOption(QFileDialog::ShowDirsOnly, true);
    m_pFileDialog->setFileMode(QFileDialog::DirectoryOnly);

	// δ����ֹ֮ͣǰ�����Զ������ļ��ķָ�洢
    m_pPullFileTimer = new QTimer();
	m_pProcess = new QProcess();

	m_objCmdThread = std::thread(&MainWidget::runThreadCmd, this);

	// �����Զ�����һ�����Ӽ��
	slotDetectStatus();
}

void MainWidget::initConnect()
{
    connect(ui.seclectBtn, &QPushButton::clicked, this, &MainWidget::slotSelectFilePath);
	connect(ui.btnStart, &QPushButton::clicked, this, &MainWidget::slotStartCaptureAudio);
	connect(ui.btnStatus, &QPushButton::clicked, this, &MainWidget::slotDetectStatus);

    connect(m_pFileDialog, &QFileDialog::currentChanged, this, &MainWidget::slotShowPath);

    connect(m_pPullFileTimer, &QTimer::timeout, this, &MainWidget::slotSaveFile);

	connect(this, &MainWidget::signalChangeStartBtn, this, &MainWidget::slotChangeStartBtn);
	connect(this, &MainWidget::signalShowInfo, this, &MainWidget::slotShowInfo);
	connect(this, &MainWidget::signalCtrlClockTimer, this, &MainWidget::slotCtrlClockTimer);
	connect(this, &MainWidget::signalSplitSave, this, &MainWidget::slotSplitSave);

}

void MainWidget::slotSelectFilePath()
{
    if (m_bStartCap)
    {
		ui.plainTextEdit->appendPlainText(u8"<WARN> ���ݲɼ������в��������·��");
        return;
    }
	m_pFileDialog->resize(720, 500);
    m_pFileDialog->show();
}

void MainWidget::slotShowPath(const QString& strPath)
{
    if (strPath.isEmpty())
    {
        return;
    }
    qDebug() << "strPath: " << strPath;
    ui.linePath->setText(strPath);
	g_mapCmd[emPull][2] = ui.linePath->text().toStdString() + "/";
	qDebug() << "mapPath: " << QString::fromStdString(g_mapCmd[emPull][2]);
}

// �������״̬
void MainWidget::slotDetectStatus()
{
	QString strDeviceInfo;
	if (detectConnectState(strDeviceInfo, m_pProcess))
	{
		m_bConnect = true;
		ui.plainTextEdit->appendPlainText(strDeviceInfo);
		ui.frameStatus->setStyleSheet("QFrame{border:2px groove #000000;border-radius:12px;background-color: rgb(0, 255, 0);}");
	}
	else
	{
		m_bConnect = false;
		ui.frameStatus->setStyleSheet("QFrame{border:2px groove #000000;border-radius:12px;background-color: rgb(255, 0, 0);}");
		ui.plainTextEdit->appendPlainText(u8"�豸�����쳣");
	}
}

void MainWidget::slotStartCaptureAudio()
{
	if (!m_bConnect)
	{
		ui.plainTextEdit->appendPlainText(u8"�豸�����쳣,�����豸����״̬");
		return;
	}

	if (!m_bStartCap)
	{
		QString strFilePath = ui.linePath->text();
		if (strFilePath.isEmpty())
		{
			ui.plainTextEdit->appendPlainText(u8"<ERR> ��ѡ��ɼ��ļ��洢·��");
			return;
		}
		// ����ץȡ����
		addThreadTask(ECtrlCmd::emStartCap);
	}
	else
	{
		// ֹͣ���ݵ�ץȡ
		addThreadTask(ECtrlCmd::emStopCap);
	}
	ui.btnStart->setEnabled(false);
	ui.btnStart->setText(u8"������...");
}

// ��ʱ�洢�ļ�
void MainWidget::slotSaveFile()
{
	addThreadTask(ECtrlCmd::emSave);
}

void MainWidget::slotChangeStartBtn(const bool& bStart, const bool& bErr, const QString& strText)
{
	ui.btnStart->setEnabled(true);
	ui.btnStart->setText(strText);

	if (bStart)
	{
		if (!bErr)
		{
			m_bStartCap = true;
			m_iSplitFileTime = ui.splitTime->text().toInt() * 60 * 1000;
			m_pPullFileTimer->start(m_iSplitFileTime);
			
		}
	}
	else
	{
		if (!bErr)
		{
			m_bStartCap = false;
			m_pPullFileTimer->stop();
		}

	}
}

void MainWidget::slotShowInfo(const bool bErr, const QString& strText)
{
	QString strInfo;
	QTime curTime = QTime::currentTime();
	if (bErr)
	{
		strInfo = QString("<ERR> ") + curTime.toString("hh:mm:ss") + QString(" ") + strText;
	}
	else
	{
		strInfo = QString("<INFO> ") + curTime.toString("hh:mm:ss") + QString(" ") + strText;
	}
	ui.plainTextEdit->appendPlainText(strInfo);
}

void MainWidget::slotCtrlClockTimer(const int& iState)
{
	switch (iState)
	{
	case EClockState::emClockStart:
	{
		ui.label_3->startClock();
		break;
	}

	case EClockState::emClockStop:
	{
		ui.label_3->stopClock();
		break;
	}

	case EClockState::emClockPause:
	{
		ui.label_3->pauseClock();
		break;
	}

	case EClockState::emClockContinue:
	{
		ui.label_3->continueClock();
		break;
	}

	default:
		break;
	}
}

void MainWidget::slotSplitSave(const bool& bStart)
{
	if (bStart)
	{
		m_pPullFileTimer->start(m_iSplitFileTime);
	}
	{
		m_pPullFileTimer->stop();
	}
}

// ֻ�ܱ�ʾָ���·��ɹ��������Ƿ�ɹ���Ҫͨ������ֵ�����ж�
bool MainWidget::addTask(const int& iCmd, QString& strRetInfo, QProcess* pProcesss)
{
	std::vector<std::string>& vecAdbCfg = g_mapCmd[iCmd];

	QStringList listAgrs;
	for (int i = 0; i < vecAdbCfg.size(); ++i)
	{
		listAgrs << QString::fromStdString(vecAdbCfg.at(i));
	}
	// ִ��ָ��

#if 0
	qDebug() << "cmd: adb " << listAgrs.join(" ");
	m_pProcess->start("adb", listAgrs);
	m_pProcess->waitForStarted();
	m_pProcess->waitForFinished();

	QString strInfo = QString::fromLocal8Bit(m_pProcess->readAllStandardOutput());
	QString strErr = QString::fromLocal8Bit(m_pProcess->readAllStandardError());

	qDebug() << "strInfo info: " << strInfo;
	qDebug() << "strErr info: " << strErr;

	if (strErr.isEmpty())
	{
		strRetInfo = strInfo;
		return true;
	}

	strRetInfo = strErr;
	return false;
#else
	strRetInfo = u8"List of devices attached\r\n127.0.0.1:58526 device\r\n\r\n";
	return true;
#endif
}

bool MainWidget::detectConnectState(QString& strDevice, QProcess* pProcesss)
{
	QString strRetInfo;
	if (addTask(ECmdNum::emDevices, strRetInfo, pProcesss))
	{
		QStringList listInfo = strRetInfo.split("\r\n");
		qDebug() << "list size: " << listInfo.size();
		if (listInfo.size() > 1 && listInfo.at(1).contains("device"))
		{
			strDevice = QString("<INFO>") + listInfo[1];
			qDebug() << listInfo.join(",");

			// ��ȡrootȨ��
			if (addTask(emRoot, strRetInfo, pProcesss))
			{
				return true;
			}
		}
	}
	return false;
}

void MainWidget::addThreadTask(ECtrlCmd enCmd)
{
	std::lock_guard<std::mutex> lg(m_objLock);
	m_listCmd.emplace_back(enCmd);
	m_objCondi.notify_all();
}

void MainWidget::runThreadCmd()
{
	m_pThreadProcess = new QProcess();

	while (!m_bStop)
	{
		// ��ȡcmd
		ECtrlCmd enCmd;
		if (ECtrlCmd::emFree != m_enCurCmd)
		{
			// ָ��ִ��ʧ�ܻ�ȴ�5��������ִ��
			if(m_bWait)
			{
				std::this_thread::sleep_for(std::chrono::seconds(5));
			}
			enCmd = m_enCurCmd;
			m_bWait = false;
			m_enCurCmd = emFree;
		}
		else
		{
			if (m_listCmd.empty())
			{
				std::unique_lock<std::mutex> lg(m_objLock);
				m_objCondi.wait(lg);
				continue;
			}

			std::lock_guard<std::mutex> lg(m_objLock);
			enCmd = m_listCmd.front();
			m_listCmd.pop_front();
		}

		QString strRetInfo;
		QString strShowInfo;

		switch (enCmd)
		{
		case ECtrlCmd::emStartCap:
		{
			if (addTask(ECmdNum::emStart, strRetInfo, m_pThreadProcess))
			{
				// �ɹ���ָ��ִ�гɹ��Ƿ��һ���жϺ�����ӣ�
				emit signalChangeStartBtn(true, false, g_strStopText);
				emit signalShowInfo(false, g_strStartText);
				emit signalCtrlClockTimer(EClockState::emClockStart);
			}
			else
			{
				// ʧ��
				emit signalChangeStartBtn(true, true, g_strStartText);
				strShowInfo = u8"����ʧ��\r\n" + strRetInfo;
				emit signalShowInfo(true, strShowInfo);
			}
			break;
		}

		case ECtrlCmd::emStopCap:
		{
			if (addTask(ECmdNum::emStop, strRetInfo, m_pThreadProcess))
			{
				// �ɹ��������ļ���ָ��ִ�гɹ��Ƿ��һ���жϺ�����ӣ�
				m_enCurCmd = ECtrlCmd::emPullFile;
				emit signalCtrlClockTimer(EClockState::emClockStop);
			}
			else
			{
				// ʧ��
				m_bWait = true;
				m_enCurCmd = ECtrlCmd::emStopCap;
				strShowInfo = u8"ָֹͣ��ִ��ʧ�ܣ������������·�\r\n" + strRetInfo;
				emit signalShowInfo(true, strShowInfo);
			}
			break;
		}

		case emPullFile:
		{
			if (addTask(ECmdNum::emPull, strRetInfo, m_pThreadProcess))
			{
				// �ļ����سɹ��ͽ����ļ������Ʊ��
				changeDirName();
				emit signalChangeStartBtn(false, false, g_strStartText);
				emit signalShowInfo(false, g_strStopText);
			}
			else
			{
				// �ļ�����ʧ��
				m_bWait = true;
				m_enCurCmd = ECtrlCmd::emPullFile;
				strShowInfo = u8"�����ļ�ָ��ʧ�ܣ������������·�\r\n" + strRetInfo;
				emit signalShowInfo(true, strShowInfo);
			}
			break;
		}

		case ECtrlCmd::emSave:
		{
			bool bStopSucess = false;
			while (!bStopSucess && !m_bStop)
			{
				bStopSucess = addTask(ECmdNum::emStop, strRetInfo, m_pThreadProcess);
				if (bStopSucess)
				{
					// ��ͣ��ʱ��
					emit signalCtrlClockTimer(EClockState::emClockPause);
					emit signalSplitSave(false);
				}
				else
				{
					std::this_thread::sleep_for(std::chrono::seconds(2));
					strShowInfo = u8"�ļ��ָ���ͣ�ɼ�ʧ�ܣ������³���\r\n" + strRetInfo;
					emit signalShowInfo(true, strShowInfo);
				}
			}

			// �ɹ��������ļ���ָ��ִ�гɹ��Ƿ��һ���жϺ�����ӣ�
			bool bPullFileSucess = false;
			while (!bPullFileSucess && !m_bStop)
			{
				bPullFileSucess = addTask(ECmdNum::emPull, strRetInfo, m_pThreadProcess);
				if (bPullFileSucess)
				{
					// ����ļ�������
					changeDirName();
				}
				{
					std::this_thread::sleep_for(std::chrono::seconds(2));
					strShowInfo = u8"�ļ��ָ��ʧ�ܣ������³���\r\n" + strRetInfo;
					emit signalShowInfo(true, strShowInfo);
				}

			}

			bool bRestartSucess = false;
			while (!bRestartSucess && !m_bStop)
			{
				bRestartSucess = addTask(ECmdNum::emStart, strRetInfo, m_pThreadProcess);
				// ��������
				if (bRestartSucess)
				{
					emit signalCtrlClockTimer(EClockState::emClockContinue);
					emit signalSplitSave(true);
				}
				else
				{
					// ��������ʧ��
					std::this_thread::sleep_for(std::chrono::seconds(2));
					strShowInfo = u8"�ļ��ָ�����������ʧ�ܣ������³�������\r\n" + strRetInfo;
					emit signalShowInfo(true, strShowInfo);
				}
			}
		}

		default:
			break;
		}

	}

	m_pThreadProcess->deleteLater();
	m_pThreadProcess = nullptr;
}


bool MainWidget::changeDirName()
{
	QString strDefaultDirName = QString::fromStdString(g_mapCmd[emPull][2]) + g_strDefaultDir;
	QString strNewDirName = QString::fromStdString(g_mapCmd[emPull][2]) + QString("audio_data_") + QTime::currentTime().toString("hh-mm-ss");

	QDir dir(strDefaultDirName);
	dir.rename(strDefaultDirName, strNewDirName);

	return true;
}