#pragma once

#include <QWidget>
#include "ui_ModTestWidget.h"

class ModTestWidget : public QWidget
{
	Q_OBJECT

public:
	ModTestWidget(QWidget *parent = nullptr);
	~ModTestWidget();

	void setCmd(const int& iCmd);

signals:
	void signalSuccessCmd(const int& iCmd, const QString& strRetInfo);
	void signalErrorCmd(const int& iCmd, const QString& strRetInfo);

private:
	Ui::ModTestWidgetClass ui;

	int m_iCmd;
};
