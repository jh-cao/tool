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

static const QString g_strStartText = u8"开始采集";
static const QString g_strStopText = u8"停止采集";
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
    // 文件框
    m_pFileDialog = new QFileDialog(this);
    // 设置只显示文件夹以及只能显示文件夹
    m_pFileDialog->setOption(QFileDialog::ShowDirsOnly, true);
    m_pFileDialog->setFileMode(QFileDialog::DirectoryOnly);

	// 未主动停止之前可以自动进行文件的分割存储
    m_pPullFileTimer = new QTimer();
	m_pProcess = new QProcess();

	m_objCmdThread = std::thread(&MainWidget::runThreadCmd, this);

	// 启动自动进行一次连接检测
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
		ui.plainTextEdit->appendPlainText(u8"<WARN> 数据采集过程中不允许更改路径");
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

// 检测连接状态
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
		ui.plainTextEdit->appendPlainText(u8"设备连接异常");
	}
}

void MainWidget::slotStartCaptureAudio()
{
	if (!m_bConnect)
	{
		ui.plainTextEdit->appendPlainText(u8"设备连接异常,请检测设备连接状态");
		return;
	}

	if (!m_bStartCap)
	{
		QString strFilePath = ui.linePath->text();
		if (strFilePath.isEmpty())
		{
			ui.plainTextEdit->appendPlainText(u8"<ERR> 请选择采集文件存储路径");
			return;
		}
		// 启动抓取数据
		addThreadTask(ECtrlCmd::emStartCap);
	}
	else
	{
		// 停止数据的抓取
		addThreadTask(ECtrlCmd::emStopCap);
	}
	ui.btnStart->setEnabled(false);
	ui.btnStart->setText(u8"处理中...");
}

// 定时存储文件
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

// 只能表示指令下发成功，具体是否成功需要通过返回值进行判断
bool MainWidget::addTask(const int& iCmd, QString& strRetInfo, QProcess* pProcesss)
{
	std::vector<std::string>& vecAdbCfg = g_mapCmd[iCmd];

	QStringList listAgrs;
	for (int i = 0; i < vecAdbCfg.size(); ++i)
	{
		listAgrs << QString::fromStdString(vecAdbCfg.at(i));
	}
	// 执行指令

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

			// 获取root权限
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
		// 获取cmd
		ECtrlCmd enCmd;
		if (ECtrlCmd::emFree != m_enCurCmd)
		{
			// 指令执行失败会等待5秒再重新执行
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
				// 成功（指令执行成功是否进一步判断后续添加）
				emit signalChangeStartBtn(true, false, g_strStopText);
				emit signalShowInfo(false, g_strStartText);
				emit signalCtrlClockTimer(EClockState::emClockStart);
			}
			else
			{
				// 失败
				emit signalChangeStartBtn(true, true, g_strStartText);
				strShowInfo = u8"启动失败\r\n" + strRetInfo;
				emit signalShowInfo(true, strShowInfo);
			}
			break;
		}

		case ECtrlCmd::emStopCap:
		{
			if (addTask(ECmdNum::emStop, strRetInfo, m_pThreadProcess))
			{
				// 成功则下载文件（指令执行成功是否进一步判断后续添加）
				m_enCurCmd = ECtrlCmd::emPullFile;
				emit signalCtrlClockTimer(EClockState::emClockStop);
			}
			else
			{
				// 失败
				m_bWait = true;
				m_enCurCmd = ECtrlCmd::emStopCap;
				strShowInfo = u8"停止指令执行失败，正尝试重新下发\r\n" + strRetInfo;
				emit signalShowInfo(true, strShowInfo);
			}
			break;
		}

		case emPullFile:
		{
			if (addTask(ECmdNum::emPull, strRetInfo, m_pThreadProcess))
			{
				// 文件下载成功就进行文件夹名称变更
				changeDirName();
				emit signalChangeStartBtn(false, false, g_strStartText);
				emit signalShowInfo(false, g_strStopText);
			}
			else
			{
				// 文件下载失败
				m_bWait = true;
				m_enCurCmd = ECtrlCmd::emPullFile;
				strShowInfo = u8"下载文件指令失败，正尝试重新下发\r\n" + strRetInfo;
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
					// 暂停计时器
					emit signalCtrlClockTimer(EClockState::emClockPause);
					emit signalSplitSave(false);
				}
				else
				{
					std::this_thread::sleep_for(std::chrono::seconds(2));
					strShowInfo = u8"文件分割暂停采集失败，正重新尝试\r\n" + strRetInfo;
					emit signalShowInfo(true, strShowInfo);
				}
			}

			// 成功则下载文件（指令执行成功是否进一步判断后续添加）
			bool bPullFileSucess = false;
			while (!bPullFileSucess && !m_bStop)
			{
				bPullFileSucess = addTask(ECmdNum::emPull, strRetInfo, m_pThreadProcess);
				if (bPullFileSucess)
				{
					// 变更文件夹名称
					changeDirName();
				}
				{
					std::this_thread::sleep_for(std::chrono::seconds(2));
					strShowInfo = u8"文件分割保存失败，正重新尝试\r\n" + strRetInfo;
					emit signalShowInfo(true, strShowInfo);
				}

			}

			bool bRestartSucess = false;
			while (!bRestartSucess && !m_bStop)
			{
				bRestartSucess = addTask(ECmdNum::emStart, strRetInfo, m_pThreadProcess);
				// 重新启动
				if (bRestartSucess)
				{
					emit signalCtrlClockTimer(EClockState::emClockContinue);
					emit signalSplitSave(true);
				}
				else
				{
					// 重新启动失败
					std::this_thread::sleep_for(std::chrono::seconds(2));
					strShowInfo = u8"文件分割保存后，重新启动失败，正重新尝试启动\r\n" + strRetInfo;
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