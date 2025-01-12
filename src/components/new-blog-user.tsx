'use client'

import { BlogCreateUserService } from '@/server/blog/blog-create-user.service'
import { UseBlogAdminStore } from '@/stores/blog-admin.store'
import { Prisma } from '@prisma/client'
import {
    Button,
    Col,
    Drawer,
    Form,
    FormProps,
    Input,
    message,
    Row,
    Select,
    Space,
    Spin,
} from 'antd'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

type Props = {
    open: boolean
    setOpen: (open: boolean) => void
}

type FieldType = {
    email: string
    role: Prisma.BlogUserUncheckedCreateInput['role']
}

export const NewBlogUser: React.FC<Props> = ({ open, setOpen }) => {
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()
    const { blogSelected } = UseBlogAdminStore()

    const newBlogUserTranslations = useTranslations('NewBlogUser')
    const formTranslations = useTranslations('Form')
    const commonTranslations = useTranslations('Common')
    const errorsTranslations = useTranslations('Errors')

    const onClose = () => setOpen(false)

    const onFinish: FormProps<Prisma.BlogUserUncheckedCreateInput>['onFinish'] =
        async values => {
            if (!blogSelected) return

            setLoading(true)
            const blogUser = await BlogCreateUserService({
                ...values,
                blogId: blogSelected.id,
            })
            setLoading(false)

            if (blogUser?.error) {
                message.error(errorsTranslations(`blog/${blogUser.error}`))
            } else {
                message.success(newBlogUserTranslations('success'))
                setOpen(false)
            }
        }

    useEffect(() => {
        const handleResetFields = () => {
            form.resetFields()
        }
        handleResetFields()
    }, [form])

    return (
        <Drawer
            title={newBlogUserTranslations('title')}
            width={520}
            onClose={onClose}
            open={open}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
            extra={
                <Space>
                    <Button onClick={onClose} className="px-2 border-lime-200">
                        {commonTranslations('cancel')}
                    </Button>
                    <Button
                        type="primary"
                        onClick={form.submit}
                        loading={loading}
                    >
                        {commonTranslations('save')}
                    </Button>
                </Space>
            }
        >
            <Spin spinning={loading}>
                <Form
                    form={form}
                    layout="vertical"
                    requiredMark="optional"
                    onFinish={onFinish}
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item<FieldType>
                                name="email"
                                label={formTranslations('user_email_label')}
                                rules={[{ required: true, max: 191 }]}
                            >
                                <Input
                                    showCount
                                    maxLength={100}
                                    placeholder="Ex: email@email.com"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item<FieldType>
                                name="role"
                                label={formTranslations('subtitle_label')}
                                rules={[{ max: 191 }]}
                            >
                                <Select
                                    placeholder="Ex: Editor"
                                    options={[
                                        {
                                            value: 'ADMIN',
                                            label: commonTranslations('admin'),
                                        },
                                        {
                                            value: 'AUTHOR',
                                            label: commonTranslations('author'),
                                        },
                                        {
                                            value: 'EDITOR',
                                            label: commonTranslations('editor'),
                                        },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </Drawer>
    )
}
