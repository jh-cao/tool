#include "ModTestWidget.h"
#include <QString>

ModTestWidget::ModTestWidget(QWidget *parent)
	: QWidget(parent)
{
	ui.setupUi(this);

	connect(ui.btnOk, &QPushButton::clicked, [this] {
		QString str = "List of devices attached\r\n127.0.0.1:58526\tdevice\r\n\r\n";
		emit signalSuccessCmd(m_iCmd, str);
	});

	connect(ui.btnErr, &QPushButton::clicked, [this] {
		QString str = "List of devices attached\r\n\r\n";
		emit signalSuccessCmd(m_iCmd, str);
	});
}


ModTestWidget::~ModTestWidget()
{

}

void ModTestWidget::setCmd(const int& iCmd)
{
	m_iCmd = iCmd;
}
